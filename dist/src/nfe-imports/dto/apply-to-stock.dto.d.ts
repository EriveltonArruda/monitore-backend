export declare class ApplyToStockDto {
    mappings: Array<{
        itemId: number;
        productId: number;
        unitPrice?: number;
    }>;
    userId?: number;
    overrideAllUnitPrice?: number;
    setCostPriceFromItem?: boolean;
    updateProductStockMirror?: boolean;
}
