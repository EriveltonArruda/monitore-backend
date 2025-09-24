import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { ApplyToStockDto } from './dto/apply-to-stock.dto';
import { Prisma } from '@prisma/client';

type FindAllParams = { search?: string; page?: number; limit?: number };

@Injectable()
export class NfeImportsService {
  constructor(private prisma: PrismaService) { }

  async findAll({ search, page = 1, limit = 10 }: FindAllParams) {
    const where: any = search
      ? {
        OR: [
          { accessKey: { contains: search } },
          { emitterName: { contains: search } },
          { destName: { contains: search } },
          { number: { contains: search } },
        ],
      }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.nfeImport.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          accessKey: true,
          number: true,
          series: true,
          issueDate: true,
          emitterName: true,
          destName: true,
          totalAmount: true,
          // opcional: pdfPath
        },
      }),
      this.prisma.nfeImport.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOneFull(id: number) {
    const nfe = await this.prisma.nfeImport.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!nfe) throw new NotFoundException('Importação não encontrada');
    return nfe;
  }

  async createFromXml(savedPath: string) {
    const abs = this.absPath(savedPath);
    let xml = '';
    try {
      xml = await fs.readFile(abs, 'utf-8');
    } catch {
      throw new BadRequestException('Não foi possível ler o arquivo XML salvo.');
    }

    const parsed = this.parseXml(xml);
    const mapped = this.mapParsedToModel(parsed);

    const upserted = await this.prisma.nfeImport.upsert({
      where: { accessKey: mapped.accessKey || '' },
      update: {
        rawXmlPath: savedPath,
        number: mapped.number,
        series: mapped.series,
        issueDate: mapped.issueDate || null,
        emitterCnpj: mapped.emitterCnpj,
        emitterName: mapped.emitterName,
        destCnpj: mapped.destCnpj,
        destName: mapped.destName,
        totalAmount: mapped.totalAmount,
        items: {
          deleteMany: {},
          create: mapped.items.map((it) => ({
            productCode: it.productCode,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
            total: it.total,
          })),
        },
      },
      create: {
        rawXmlPath: savedPath,
        accessKey: mapped.accessKey || null,
        number: mapped.number,
        series: mapped.series,
        issueDate: mapped.issueDate || null,
        emitterCnpj: mapped.emitterCnpj,
        emitterName: mapped.emitterName,
        destCnpj: mapped.destCnpj,
        destName: mapped.destName,
        totalAmount: mapped.totalAmount,
        items: {
          create: mapped.items.map((it) => ({
            productCode: it.productCode,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
            total: it.total,
          })),
        },
      },
      include: { items: true },
    });

    return upserted;
  }

  async reprocess(id: number) {
    const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('Importação não encontrada');
    if (!nfe.rawXmlPath) throw new BadRequestException('Importação não possui caminho do XML.');
    return this.createFromXml(nfe.rawXmlPath);
  }

  async getRawXmlPath(id: number) {
    const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('Importação não encontrada');
    if (!nfe.rawXmlPath) throw new NotFoundException('XML não associado.');

    const abs = this.absPath(nfe.rawXmlPath);
    const filename = (nfe.accessKey || `nfe-${id}`) + '.xml';
    return { abs, filename };
  }

  async update(id: number, dto: any) {
    await this.ensureExists(id);
    return this.prisma.nfeImport.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.nfeImport.delete({ where: { id } });
  }

  // ====== APLICAR AO ESTOQUE ======
  async applyToStock(id: number, dto: ApplyToStockDto) {
    const nfe = await this.prisma.nfeImport.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!nfe) throw new NotFoundException('Importação não encontrada');

    if (!dto?.mappings?.length)
      throw new BadRequestException('Envie os mapeamentos de itens → produtos.');

    const mapByItemId = new Map<number, { productId: number; unitPrice?: number }>();
    for (const m of dto.mappings) {
      if (!m.itemId || !m.productId) {
        throw new BadRequestException('itemId e productId são obrigatórios em cada mapping.');
      }
      mapByItemId.set(m.itemId, { productId: m.productId, unitPrice: m.unitPrice });
    }

    const ops: Prisma.PrismaPromise<any>[] = [];

    for (const it of nfe.items) {
      const map = mapByItemId.get(it.id);
      if (!map) continue;

      const quantity = Number(it.quantity || 0);
      if (!quantity || isNaN(quantity)) continue;

      const unitPrice =
        dto.overrideAllUnitPrice ??
        map.unitPrice ??
        (it.unitPrice != null ? Number(it.unitPrice) : undefined);

      ops.push(
        this.prisma.stockMovement.create({
          data: {
            type: 'ENTRADA',
            quantity: Math.round(quantity),
            details: `Entrada via NF-e Nº ${nfe.number || ''} SÉRIE ${nfe.series || ''}`.trim(),
            relatedParty: nfe.emitterName || null,
            unitPriceAtMovement: unitPrice ?? null,
            notes: null,
            document: nfe.accessKey || null,
            product: { connect: { id: map.productId } },
            user: { connect: { id: dto.userId ?? 1 } },
          },
        }),
      );

      if (dto.setCostPriceFromItem && unitPrice != null) {
        ops.push(
          this.prisma.product.update({
            where: { id: map.productId },
            data: { costPrice: unitPrice },
          }),
        );
      }

      if (dto.updateProductStockMirror) {
        ops.push(
          this.prisma.product.update({
            where: { id: map.productId },
            data: { stockQuantity: { increment: Math.round(quantity) } },
          }),
        );
      }
    }

    await this.prisma.$transaction(ops);

    return { ok: true, movementsCreated: ops.length };
  }

  // ====== PDF: anexar / obter / remover ======
  async attachPdf(id: number, savedPath: string) {
    const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('Importação não encontrada');

    // se já existir um pdf, remove o antigo para evitar lixo no disco
    if (nfe.pdfPath && nfe.pdfPath !== savedPath) {
      const oldAbs = this.absPath(nfe.pdfPath);
      try {
        await fs.unlink(oldAbs);
      } catch {
        /* ignora se já não existir */
      }
    }

    const updated = await this.prisma.nfeImport.update({
      where: { id },
      data: { pdfPath: savedPath },
    });

    return { ok: true, pdfPath: updated.pdfPath };
  }

  async getPdfPath(id: number) {
    const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('Importação não encontrada');
    if (!nfe.pdfPath) throw new NotFoundException('PDF não associado.');

    const abs = this.absPath(nfe.pdfPath);
    const filename = (nfe.accessKey || `nfe-${id}`) + '.pdf';
    return { abs, filename };
  }

  async removePdf(id: number) {
    const nfe = await this.prisma.nfeImport.findUnique({ where: { id } });
    if (!nfe) throw new NotFoundException('Importação não encontrada');
    if (!nfe.pdfPath) return; // nada a remover

    const abs = this.absPath(nfe.pdfPath);
    try {
      await fs.unlink(abs);
    } catch {
      /* ignora erro de inexistente */
    }

    await this.prisma.nfeImport.update({
      where: { id },
      data: { pdfPath: null },
    });
  }

  // ====== Helpers ======
  private absPath(savedPath: string) {
    const rel = savedPath.replace(/^\//, '');
    return join(process.cwd(), rel);
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.nfeImport.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Importação não encontrada');
  }

  private parseXml(xml: string) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
    });
    return parser.parse(xml);
  }

  private mapParsedToModel(parsed: any) {
    const inf =
      parsed?.nfeProc?.NFe?.infNFe ||
      parsed?.NFe?.infNFe ||
      parsed?.nfeProc?.NFe?.infNFe?.[0] ||
      parsed?.NFe?.infNFe?.[0];

    if (!inf) throw new BadRequestException('Estrutura de NFe não reconhecida.');

    const ide = inf.ide || {};
    const emit = inf.emit || {};
    const dest = inf.dest || {};

    const accessKey =
      parsed?.nfeProc?.protNFe?.infProt?.chNFe ||
      parsed?.protNFe?.infProt?.chNFe ||
      null;

    let det = inf.det || [];
    if (!Array.isArray(det)) det = [det];

    const items = det.map((d: any) => {
      const prod = d?.prod || {};
      const qCom = Number(prod.qCom ?? prod.qTrib ?? 0);
      const vUnCom = Number(prod.vUnCom ?? prod.vUnTrib ?? 0);
      const vProd = Number(prod.vProd ?? qCom * vUnCom ?? 0);

      return {
        productCode: prod.cProd ?? prod.cEAN ?? null,
        description: prod.xProd ?? null,
        quantity: isNaN(qCom) ? null : qCom,
        unit: prod.uCom ?? prod.uTrib ?? null,
        unitPrice: isNaN(vUnCom) ? null : vUnCom,
        total: isNaN(vProd) ? null : vProd,
      };
    });

    const totalAmount =
      Number(inf.total?.ICMSTot?.vNF ?? inf.total?.ICMSTot?.vProd ?? 0) || null;

    const issueDateStr = ide.dhEmi || ide.dEmi || null;
    const issueDate = issueDateStr ? new Date(issueDateStr) : null;

    return {
      accessKey,
      number: (ide.nNF ?? ide.nNF?.toString() ?? null) as string | null,
      series: (ide.serie ?? ide.serie?.toString() ?? null) as string | null,
      issueDate,
      emitterCnpj: emit.CNPJ ?? null,
      emitterName: emit.xNome ?? null,
      destCnpj: dest.CNPJ ?? null,
      destName: dest.xNome ?? null,
      totalAmount,
      items,
    };
  }
}
