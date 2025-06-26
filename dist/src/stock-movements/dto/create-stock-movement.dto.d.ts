export declare class CreateStockMovementDto {
    productId: number;
    type: string;
    quantity: number;
    details: string;
    relatedParty?: string;
    unitPriceAtMovement?: number;
    notes?: string;
    document?: string;
    userId?: number;
}
