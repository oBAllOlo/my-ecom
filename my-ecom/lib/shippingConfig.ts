// ==========================================
//     การตั้งค่าค่าจัดส่ง (Shipping Config)
// ==========================================

export const shippingConfig = {
    // ค่าจัดส่งปกติ (บาท)
    shippingCost: 50,

    // ยอดขั้นต่ำสำหรับส่งฟรี (บาท)
    // ถ้าลูกค้าสั่งซื้อถึงยอดนี้ จะได้ส่งฟรี
    freeShippingThreshold: 1500,
};

// ฟังก์ชันคำนวณค่าจัดส่ง
export function calculateShipping(subtotal: number): number {
    if (subtotal >= shippingConfig.freeShippingThreshold) {
        return 0; // ส่งฟรี
    }
    return shippingConfig.shippingCost;
}

// ฟังก์ชันคำนวณยอดที่ต้องสั่งเพิ่มเพื่อได้ส่งฟรี
export function getAmountForFreeShipping(subtotal: number): number {
    if (subtotal >= shippingConfig.freeShippingThreshold) {
        return 0; // ได้ส่งฟรีแล้ว
    }
    return shippingConfig.freeShippingThreshold - subtotal;
}

// ตรวจสอบว่าได้ส่งฟรีหรือยัง
export function isFreeShipping(subtotal: number): boolean {
    return subtotal >= shippingConfig.freeShippingThreshold;
}
