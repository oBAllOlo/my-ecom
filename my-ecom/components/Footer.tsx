import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-section">
            <Link href="/" className="footer-logo">
              <span className="logo-icon">⌨️</span>
              <span className="logo-text">
                KeyBoard<span className="logo-highlight">TH</span>
              </span>
            </Link>
            <p className="footer-description">
              ร้านคีย์บอร์ดคุณภาพ จำหน่ายคีย์บอร์ด Mechanical และ Gaming
              จากแบรนด์ชั้นนำทั่วโลก พร้อมบริการหลังการขาย
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                📘
              </a>
              <a href="#" className="social-link">
                📸
              </a>
              <a href="#" className="social-link">
                🐦
              </a>
              <a href="#" className="social-link">
                📺
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">ลิงก์ด่วน</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">หน้าแรก</Link>
              </li>
              <li>
                <Link href="/products">สินค้าทั้งหมด</Link>
              </li>
              <li>
                <Link href="/products?category=gaming">คีย์บอร์ดเกมมิ่ง</Link>
              </li>
              <li>
                <Link href="/products?category=wireless">คีย์บอร์ดไร้สาย</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3 className="footer-title">บริการลูกค้า</h3>
            <ul className="footer-links">
              <li>
                <a href="#">วิธีการสั่งซื้อ</a>
              </li>
              <li>
                <a href="#">การจัดส่งสินค้า</a>
              </li>
              <li>
                <a href="#">นโยบายการคืนสินค้า</a>
              </li>
              <li>
                <a href="#">คำถามที่พบบ่อย</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">ติดต่อเรา</h3>
            <div className="contact-info">
              <p>📍 กรุงเทพมหานคร, ประเทศไทย</p>
              <p>📞 02-XXX-XXXX</p>
              <p>📧 contact@keyboardth.com</p>
              <p>🕐 จันทร์-เสาร์ 9:00-18:00</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© 2024 KeyBoardTH. สงวนลิขสิทธิ์ทุกประการ</p>
          <div className="footer-bottom-links">
            <a href="#">นโยบายความเป็นส่วนตัว</a>
            <a href="#">เงื่อนไขการใช้งาน</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
