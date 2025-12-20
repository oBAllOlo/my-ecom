"use client";

export default function CustomKeyboardPage() {
    return (
        <div style={{
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⌨️</div>
            <h1 style={{
                color: "white",
                fontSize: "2.5rem",
                fontWeight: 700,
                marginBottom: "1rem"
            }}>
                คีย์บอร์ดคัสตอม
            </h1>
            <p style={{
                color: "#94a3b8",
                fontSize: "1.1rem",
                maxWidth: "500px"
            }}>
                🚧 หน้านี้กำลังพัฒนา - Coming Soon!
            </p>
        </div>
    );
}
