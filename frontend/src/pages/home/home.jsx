import React from 'react'
import { Link } from 'react-router-dom'
import "./home.css"

function Home() {
  return (
    <div className="home-container">
      <img
        src="https://i.imgur.com/R12QXeF.png"
        alt="Screenshot"
        style={{ maxWidth: '500px', height: 'auto' }}
      />
      <div className="hero-text">
        <h1>Willkommen bei Successify</h1>
        <p className="description">
          Ihr persönlicher Begleiter für ein erfolgreiches und strukturiertes Leben.
          Mit Successify haben Sie alle wichtigen Tools an einem Ort:
        </p>
        <ul className="features-list">
          <Link to="/scheduler" className="feature-link">
            <li>📅 Terminkalender: Organisieren Sie Ihren Alltag effizient</li>
          </Link>
          <Link to="/shoppinglist" className="feature-link">
            <li>🛒 Shopping-App: Verwalten Sie Ihre Einkäufe übersichtlich</li>
          </Link>
          <Link to="/todo" className="feature-link">
            <li>✅ To-Do-Liste: Behalten Sie den Überblick über Ihre Aufgaben</li>
          </Link>
          <Link to="/finances" className="feature-link">
            <li>💰 Finanzplaner: Setzen Sie Ihre finanziellen Ziele um und behalten diese im Überblick</li>
          </Link>
          <Link to="/pomodoro" className="feature-link">
            <li>⏱️ Pomodoro-Timer: Steigern Sie Ihre Produktivität mit der Pomodoro-Technik</li>
          </Link>
        </ul>
        <p className="motivation">
          Starten Sie jetzt Ihre Reise zu mehr Produktivität und Erfolg.
          Successify hilft Ihnen dabei, Ihr Leben zu strukturieren und Ihre Ziele zu erreichen.
        </p>
      </div>
    </div>
  )
}

export default Home
