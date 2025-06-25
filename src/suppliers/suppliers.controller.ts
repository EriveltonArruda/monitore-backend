// ARMAZÉM DE FERRAMENTAS
// Aqui, nós importamos todas as "ferramentas" que vamos usar neste arquivo.
// Elas vêm do pacote '@nestjs/common', que é a caixa de ferramentas principal do NestJS.
// - Controller, Get, Post, etc: São "Decorators", usados para dar superpoderes às nossas classes e métodos.
// - Body, Param: Usados para extrair informações da requisição (do corpo e da URL).
// - ParseIntPipe: Uma ferramenta para converter texto em número de forma segura.
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';

// O "CÉREBRO"
// Importamos a classe SuppliersService. O Controller não pensa, ele apenas delega
// toda a lógica e trabalho pesado para o Service.
import { SuppliersService } from './suppliers.service';

// OS "CONTRATOS"
// Importamos os DTOs (Data Transfer Objects). Eles são como contratos que definem
// exatamente quais dados nossa API espera receber para criar ou atualizar um fornecedor.
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';


// O DECORATOR @Controller
// Esta linha é a mais importante. Ela transforma uma classe normal em um Controller.
// O texto 'suppliers' define o caminho base da URL para este porteiro.
// Ou seja, tudo aqui dentro responderá a requisições que começam com /suppliers.
@Controller('suppliers')
export class SuppliersController {

  // INJEÇÃO DE DEPENDÊNCIA (A MÁGICA DO NESTJS)
  // Este é o construtor da classe. Aqui acontece a "Injeção de Dependência".
  // Nós simplesmente declaramos que esta classe PRECISA de uma instância do SuppliersService.
  // O NestJS automaticamente se encarrega de fornecer essa instância para nós.
  // Não precisamos fazer `new SuppliersService()` em nenhum lugar.
  constructor(private readonly suppliersService: SuppliersService) { }

  // ENDPOINT PARA CRIAÇÃO (POST /suppliers)
  // @Post() diz: "Este método responde a requisições do tipo POST".
  // @Body() diz: "Pegue o corpo (body) da requisição, valide-o usando o CreateSupplierDto,
  // e entregue-o para a variável `createSupplierDto`."
  // A função então simplesmente repassa os dados para o service fazer o trabalho sujo.
  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  // ENDPOINT PARA LISTAGEM (GET /suppliers)
  // @Get() diz: "Este método responde a requisições do tipo GET".
  // Ele chama o service para buscar todos os fornecedores.
  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  // ENDPOINT PARA BUSCA ÚNICA (GET /suppliers/:id)
  // @Get(':id') diz: "Responda a requisições GET que tenham um ID na URL (ex: /suppliers/12)".
  // @Param('id', ParseIntPipe) diz: "Pegue o 'id' da URL, use o ParseIntPipe para
  // convertê-lo para um número, e entregue-o para a variável `id`."
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  // ENDPOINT PARA ATUALIZAÇÃO (PATCH /suppliers/:id)
  // @Patch(':id') funciona de forma parecida com o @Get(':id'), mas para requisições PATCH.
  // Ele precisa tanto do ID da URL (@Param) quanto dos novos dados que vêm no corpo (@Body).
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  // ENDPOINT PARA DELEÇÃO (DELETE /suppliers/:id)
  // @Delete(':id') responde a requisições DELETE e, assim como os outros,
  // apenas pega o ID validado e passa para o service executar a exclusão.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}