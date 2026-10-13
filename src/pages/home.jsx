
import Navbar from "../components/Navbar"
import { Link } from "react-router-dom";

function Home() {
    return (
      <div>
        <Navbar />
  
        <section className="hero">
          <div className="hero-content">
            <h1>
              Duterane amafaranga,
              <span> dutere imbere hamwe.</span>
            </h1>
  
            <p>
              Kora ikimina online, huza abanyamuryango,
              kora contributions kandi ukurikirane amafaranga
              yawe ahantu hamwe.
            </p>
  
            <div className="hero-buttons">
              <Link to="/register">
                <button className="primary-btn">
                  Tangira Ikimina
                </button>
              </Link>
  
              <Link to="/login">
                <button className="secondary-btn">
                  Injira mu Kimina
                </button>
              </Link>
            </div>
          </div>
        </section>
  
        <section className="how-it-works">
          <h2>Uko IKIMINA gikora</h2>
  
          <p className="section-description">
            IKIMINA kigufasha gukorana n’abandi banyamuryango
            mutari ahantu hamwe.
          </p>
  
          <div className="steps">
            <div className="step-card">
              <div className="step-icon">💰</div>
  
              <h3>Tanga</h3>
  
              <p>
                Buri munyamuryango atanga amafaranga
                hakurikijwe gahunda y’ikimina.
              </p>
            </div>
  
            <div className="step-card">
              <div className="step-icon">🤝</div>
  
              <h3>Kusanya</h3>
  
              <p>
                System ikurikirana contributions zose
                kandi ikabika records z’amafaranga.
              </p>
            </div>
  
            <div className="step-card">
              <div className="step-icon">🎯</div>
  
              <h3>Gusesa</h3>
  
              <p>
                Iyo igihe cyo gusesa kigeze, amafaranga
                agabanywa hakurikijwe gahunda y’ikimina.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  export default Home