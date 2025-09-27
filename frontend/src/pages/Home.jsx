// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';

const css = `
:root {
  --bg: #F7F9FC;
  --primary: #4A90E2;
  --secondary: #50E3C2;
  --accent: #F5A623;
  --cta: #7B61FF;
  --text: #333333;
  --radius: 0.75rem;
  --transition: 0.3s ease;
  --shadow: 0 4px 20px rgba(0,0,0,0.08);
}
* { box-sizing: border-box; margin:0; padding:0; }
body, #root { 
  font-family: 'Inter', 'Segoe UI', sans-serif; 
  background: var(--bg); 
  color: var(--text);
  overflow-x: hidden;
}
.container { width: 90%; max-width:1200px; margin: auto; padding: 2rem 0; }
a { text-decoration: none; color: inherit; }
section { padding: 4rem 0; }

/* Animation Keyframes */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Navbar */
.navbar {
  display: flex; justify-content: space-between; align-items:center;
  background: rgba(255,255,255,0.95); padding: 1rem 5%; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky; top: 0; z-index: 1000;
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;
}
.navbar.scrolled {
  padding: 0.7rem 5%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.navbar .logo { 
  font-size:1.8rem; font-weight:800; 
  color: var(--primary);
  display: flex; align-items: center;
}
.navbar .logo span { color: var(--accent); }
.navbar nav { display:flex; align-items:center; gap: 1.2rem; }
.navbar nav a { 
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: color var(--transition);
}
.navbar nav a:hover { color: var(--primary); }
.navbar nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}
.navbar nav a:hover::after {
  width: 100%;
}
.navbar .lang-switch { 
  margin-right:0.5rem; 
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  background: rgba(74,144,226,0.1);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  font-weight: 500;
}
.navbar .lang-switch:hover {
  background: rgba(74,144,226,0.2);
}
.navbar .auth-buttons {
  display: flex;
  gap: 0.8rem;
}
.navbar .auth-buttons button {
  padding:0.6rem 1.2rem; border:none; border-radius:var(--radius);
  cursor:pointer; transition: all var(--transition);
  font-weight: 600;
  font-size: 0.95rem;
}
.btn-sso { 
  background: rgba(80,227,194,0.15); 
  color: var(--text);
}
.btn-sso:hover { 
  background: rgba(80,227,194,0.25); 
}
.btn-login { 
  background: var(--cta); 
  color:#fff; 
  box-shadow: 0 4px 12px rgba(123,97,255,0.3);
}
.btn-login:hover { 
  background: #6a4df0; 
  box-shadow: 0 6px 15px rgba(123,97,255,0.4);
}

/* Hero */
.hero {
  display:flex; align-items:center; justify-content: space-between;
  padding: 6rem 0 4rem;
  min-height: 90vh;
}
.hero-text { 
  flex: 1;
  max-width: 600px;
}
.hero-text h1 { 
  font-size:3.2rem; 
  line-height:1.2; 
  margin-bottom:1.5rem;
  font-weight: 800;
}
.hero-text h1 span {
  color: var(--primary);
  position: relative;
}
.hero-text h1 span::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(74,144,226,0.2);
  z-index: -1;
}
.hero-text p { 
  font-size:1.2rem; 
  margin-bottom:2rem;
  line-height: 1.7;
  color: #555;
}
.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.btn-primary {
  background: var(--primary); 
  color:#fff; 
  padding:0.9rem 2rem;
  border:none; 
  border-radius:var(--radius); 
  cursor:pointer;
  transition: all var(--transition);
  font-weight: 600;
  font-size: 1.05rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 15px rgba(74,144,226,0.3);
}
.btn-primary:hover { 
  background: #3a78c1; 
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(74,144,226,0.4);
}
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 2px solid rgba(0,0,0,0.1);
  padding:0.9rem 1.8rem;
  border-radius:var(--radius); 
  cursor:pointer;
  transition: all var(--transition);
  font-weight: 600;
  font-size: 1.05rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.btn-secondary:hover { 
  border-color: var(--primary);
  color: var(--primary);
}
.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
}
.hero-feature {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255,255,255,0.8);
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(5px);
}
.hero-feature .icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(74,144,226,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--primary);
}
.hero-img { 
  flex:1; 
  text-align:center;
  position: relative;
}
.hero-img .main-img {
  width: 90%;
  max-width: 600px;
  border-radius: var(--radius);
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  animation: float 6s ease-in-out infinite;
}
.hero-img .floating {
  position: absolute;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: float 8s ease-in-out infinite;
}
.hero-img .floating-1 {
  width: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0.5s;
}
.hero-img .floating-2 {
  width: 150px;
  bottom: 10%;
  right: 5%;
  animation-delay: 1s;
}
.hero-img .floating-3 {
  width: 100px;
  top: 40%;
  right: 15%;
  animation-delay: 1.5s;
}

/* Section Title */
.section-title {
  text-align:center; 
  margin: 3rem 0 4rem; 
  font-size:2.5rem; 
  color: var(--text);
  font-weight: 800;
  position: relative;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: var(--primary);
  border-radius: 2px;
}
.section-subtitle {
  text-align: center;
  font-size: 1.2rem;
  max-width: 700px;
  margin: -2rem auto 4rem;
  color: #666;
  line-height: 1.7;
}

/* Features */
.feature-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
}
.card {
  background:#fff; 
  border-radius:var(--radius); 
  padding: 2rem;
  box-shadow: var(--shadow);
  transition: all var(--transition);
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}
.card:hover { 
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: var(--primary);
}
.card .icon { 
  font-size:2.5rem; 
  margin-bottom:1.5rem;
  color: var(--primary);
}
.card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.card p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}
.card .tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.card .tag {
  background: rgba(74,144,226,0.1);
  color: var(--primary);
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
}

/* UX Scenarios */
.ux-section {
  background: linear-gradient(135deg, rgba(247,249,252,1) 0%, rgba(235,243,255,1) 100%);
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}
.ux-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(80,227,194,0.1);
  z-index: 0;
}
.ux-section::after {
  content: '';
  position: absolute;
  bottom: -150px;
  left: -100px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: rgba(123,97,255,0.08);
  z-index: 0;
}
.ux-cards { 
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.ux-card { 
  flex: 1 1 400px; 
  background: rgba(255,255,255,0.9); 
  border-radius:var(--radius); 
  padding: 2.5rem;
  box-shadow: var(--shadow);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all var(--transition);
}
.ux-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}
.ux-card h4 { 
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.ux-card h4 span {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.parent-icon {
  background: rgba(80,227,194,0.15);
  color: #2a9d8f;
}
.student-icon {
  background: rgba(245,166,35,0.15);
  color: #e76f51;
}
.ux-card ul { 
  list-style: none;
  padding-left: 0;
}
.ux-card li {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}
.ux-card li::before {
  content: '✓';
  color: var(--primary);
  font-weight: bold;
}
.ux-card li:last-child {
  border-bottom: none;
}

/* Levels */
.levels-section {
  padding: 5rem 0;
  background: #fff;
}
.levels { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 2.5rem;
}
.level {
  background:#fff; 
  border-radius:var(--radius); 
  padding: 2.5rem;
  box-shadow: var(--shadow);
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
  border-top: 5px solid;
}
.level:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}
.level::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 100%);
  z-index: 0;
}
.level-content {
  position: relative;
  z-index: 1;
}
.level h3 {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}
.level h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 50px;
  height: 3px;
  border-radius: 2px;
}
.level.beginner { 
  border-color: var(--secondary);
}
.level.beginner h3::after {
  background: var(--secondary);
}
.level.inter { 
  border-color: var(--primary);
}
.level.inter h3::after {
  background: var(--primary);
}
.level.advanced { 
  border-color: var(--accent);
}
.level.advanced h3::after {
  background: var(--accent);
}
.level ol {
  list-style: none;
  counter-reset: level-counter;
  padding-left: 0;
}
.level li {
  counter-increment: level-counter;
  margin-bottom: 1.5rem;
  padding-left: 3rem;
  position: relative;
  line-height: 1.6;
}
.level li::before {
  content: counter(level-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}
.level.beginner li::before {
  background: rgba(80,227,194,0.15);
  color: #2a9d8f;
}
.level.inter li::before {
  background: rgba(74,144,226,0.15);
  color: var(--primary);
}
.level.advanced li::before {
  background: rgba(245,166,35,0.15);
  color: #e76f51;
}

/* Pricing & Security */
.info-sections { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
  gap: 2.5rem;
  margin: 3rem 0;
}
.info { 
  background:#fff; 
  border-radius:var(--radius); 
  padding: 2.5rem;
  box-shadow: var(--shadow);
}
.info h3 { 
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
  position: relative;
  padding-bottom: 0.8rem;
}
.info h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}
.info ul { 
  list-style: none;
  padding-left: 0;
}
.info li {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.info li::before {
  content: '•';
  color: var(--primary);
  font-size: 1.5rem;
}
.info li:last-child {
  border-bottom: none;
}

/* Testimonials */
.testimonials-section {
  background: linear-gradient(135deg, rgba(247,249,252,1) 0%, rgba(235,243,255,1) 100%);
  padding: 5rem 0;
}
.testimonials { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 2.5rem;
}
.testimonial {
  background:#fff; 
  padding: 2.5rem; 
  border-radius:var(--radius);
  box-shadow: var(--shadow);
  position:relative;
  transition: all var(--transition);
}
.testimonial:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}
.testimonial::before {
  content: "“"; 
  font-size:6rem; 
  color: var(--primary);
  position:absolute; 
  top: 10px; 
  left: 20px;
  opacity: 0.1;
}
.testimonial p { 
  margin:1.5rem 0; 
  font-style: italic;
  color: #555;
  line-height: 1.7;
  position: relative;
  z-index: 1;
}
.testimonial h5 { 
  text-align:right; 
  color: var(--primary);
  font-weight: 600;
  font-size: 1.1rem;
}

/* FAQ Accordion */
.faq-section {
  padding: 5rem 0;
  background: #fff;
}
.faq { 
  max-width:800px; 
  margin:3rem auto 5rem;
}
.faq-item { 
  background:#fff; 
  border-radius:var(--radius); 
  margin-bottom:1rem; 
  overflow:hidden; 
  box-shadow: var(--shadow);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all var(--transition);
}
.faq-item:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.faq-question {
  padding:1.5rem; 
  cursor:pointer; 
  position:relative;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.faq-question span {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(74,144,226,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all var(--transition);
}
.faq-question.open span {
  transform: rotate(45deg);
}
.faq-answer {
  max-height:0; 
  padding:0 1.5rem; 
  overflow: hidden;
  transition: all var(--transition);
  color: #555;
  line-height: 1.7;
}
.faq-answer.open { 
  max-height:500px; 
  padding:0 1.5rem 1.5rem;
}

/* Contact */
.contact-section {
  background: linear-gradient(135deg, rgba(123,97,255,0.03) 0%, rgba(74,144,226,0.05) 100%);
  padding: 5rem 0;
}
.contact {
  background:#fff; 
  padding:3rem; 
  border-radius:var(--radius);
  box-shadow: var(--shadow);
  max-width:800px; 
  margin: 0 auto;
}
.contact h3 { 
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--primary);
}
.contact form { 
  display:flex; 
  flex-direction:column;
}
.contact .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.contact input, .contact textarea, .contact select {
  margin-bottom:1rem; 
  padding:1rem; 
  border:1px solid rgba(0,0,0,0.1); 
  border-radius:var(--radius);
  font-family: inherit;
  font-size: 1rem;
  transition: all var(--transition);
}
.contact input:focus, .contact textarea:focus, .contact select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(74,144,226,0.2);
}
.contact textarea {
  min-height: 150px;
  resize: vertical;
}
.contact button {
  align-self:center; 
  background: var(--cta); 
  color:#fff; 
  border:none;
  padding:1rem 2.5rem; 
  border-radius:var(--radius); 
  cursor:pointer;
  transition: all var(--transition);
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(123,97,255,0.3);
}
.contact button:hover { 
  background:#6a4df0; 
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(123,97,255,0.4);
}

/* Footer */
.footer {
  background: #fff;
  padding: 4rem 0 2rem;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
}
.footer-column h4 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--text);
  position: relative;
  padding-bottom: 0.5rem;
}
.footer-column h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}
.footer-column ul {
  list-style: none;
  padding-left: 0;
}
.footer-column li {
  margin-bottom: 0.8rem;
}
.footer-column a {
  color: #666;
  transition: color var(--transition);
}
.footer-column a:hover {
  color: var(--primary);
}
.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.05);
  color: #666;
  font-size: 0.95rem;
}

/* Interactive Exercises */
.exercises-section {
  padding: 5rem 0;
  background: #fff;
}
.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
.exercise-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  transition: all var(--transition);
  text-align: center;
  border: 1px solid rgba(0,0,0,0.05);
}
.exercise-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}
.exercise-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(74,144,226,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.8rem;
  color: var(--primary);
}
.exercise-card h4 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}
.exercise-card p {
  color: #666;
  line-height: 1.6;
}

/* Technical Elements */
.tech-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, rgba(80,227,194,0.03) 0%, rgba(245,166,35,0.05) 100%);
}
.tech-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.tech-table th {
  background: var(--primary);
  color: white;
  text-align: left;
  padding: 1.2rem 1.5rem;
  font-weight: 600;
}
.tech-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.tech-table tr:last-child td {
  border-bottom: none;
}
.tech-table tr:nth-child(even) {
  background: rgba(247,249,252,0.5);
}
.tech-table tr:hover {
  background: rgba(74,144,226,0.03);
}

/* Security Features */
.security-section {
  padding: 5rem 0;
  background: #fff;
}
.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.security-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border-left: 4px solid var(--primary);
  transition: all var(--transition);
}
.security-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}
.security-card h4 {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}
.security-card h4 span {
  color: var(--primary);
  font-size: 1.5rem;
}
.security-card ul {
  list-style: none;
  padding-left: 0;
}
.security-card li {
  padding: 0.5rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}
.security-card li::before {
  content: '✓';
  color: var(--primary);
  font-weight: bold;
  flex-shrink: 0;
}

/* Scroll to top */
.scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all var(--transition);
  z-index: 100;
  opacity: 0;
  transform: translateY(20px);
}
.scroll-top.visible {
  opacity: 1;
  transform: translateY(0);
}
.scroll-top:hover {
  background: #3a78c1;
  transform: translateY(-3px);
}

@media (max-width: 992px) {
  .navbar nav {
    gap: 0.8rem;
  }
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 4rem 0;
  }
  .hero-text {
    max-width: 100%;
    margin-bottom: 3rem;
  }
  .hero-buttons {
    justify-content: center;
  }
  .hero-features {
    justify-content: center;
  }
  .contact .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 5%;
  }
  .navbar nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  .navbar .auth-buttons {
    margin-top: 0.5rem;
  }
  .section-title {
    font-size: 2rem;
  }
  .ux-cards {
    flex-direction: column;
  }
  .info-sections {
    grid-template-columns: 1fr;
  }
}
`;

export default function Home() {
  const [lang, setLang] = useState('FR');
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef(null);

  // Track scroll position for navbar and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    document.title = `CodeGenesis • Apprentissage interactif de programmation`;
  }, []);

  const features = [
    { 
      icon: '🎓', 
      title: 'Parcours modulaires', 
      text: 'Scratch → Python avec des tests de niveau automatiques pour chaque étape du parcours.',
      tags: ['Apprentissage', 'Adaptatif']
    },
    { 
      icon: '🧩', 
      title: 'Contenus interactifs', 
      text: 'Quiz, puzzles de code, projets guidés et exercices de glisser-déposer pour un apprentissage engageant.',
      tags: ['Engagement', 'Pratique']
    },
    { 
      icon: '🏆', 
      title: 'Gamification', 
      text: 'Système de points, badges, classements et défis hebdomadaires pour motiver les apprenants.',
      tags: ['Motivation', 'Récompenses']
    },
    { 
      icon: '🌐', 
      title: 'Multilingue', 
      text: 'Interface et contenus disponibles en français, arabe et anglais avec changement instantané.',
      tags: ['Accessibilité', 'Inclusion']
    },
    { 
      icon: '👥', 
      title: 'Tableaux de bord', 
      text: 'Suivi en temps réel des progrès pour élèves et parents, avec rapports hebdomadaires.',
      tags: ['Suivi', 'Transparence']
    },
    { 
      icon: '🔒', 
      title: 'Sécurité renforcée', 
      text: 'Environnement cloisonné, contrôle parental et conformité RGPD pour une expérience sécurisée.',
      tags: ['Sécurité', 'Confiance']
    },
  ];

  const interactiveExercises = [
    { 
      icon: '❓', 
      title: 'Quiz à choix multiples', 
      text: 'Test rapide de compréhension sur un point précis avec plusieurs propositions.' 
    },
    { 
      icon: '↔️', 
      title: 'Drag and Drop', 
      text: 'Glisser-déposer d\'éléments pour association, classification ou reconstitution.' 
    },
    { 
      icon: '📝', 
      title: 'Remplir les blancs', 
      text: 'Compléter une phrase ou un code en insérant les bons mots ou commandes.' 
    },
    { 
      icon: '✅', 
      title: 'Vrai ou Faux', 
      text: 'Indiquer si une affirmation est correcte ou incorrecte pour vérifier les connaissances.' 
    },
    { 
      icon: '🧩', 
      title: 'Puzzles de code', 
      text: 'Résoudre un défi logique ou remettre des blocs de code dans le bon ordre.' 
    },
    { 
      icon: '🎨', 
      title: 'ColorPages interactifs', 
      text: 'Colorier selon des consignes éducatives associant couleurs à fonctions ou catégories.' 
    },
    { 
      icon: '💻', 
      title: 'Code à compléter', 
      text: 'Compléter un bout de code avec les bonnes instructions pour renforcer la syntaxe.' 
    },
    { 
      icon: '⏱️', 
      title: 'QCM avec minuterie', 
      text: 'Test chronométré simulant les conditions d\'examen pour évaluer les connaissances.' 
    },
  ];

  const technicalElements = [
    { element: 'Zone cours interactive', tool: 'React markdown + vidéo + texte toggle' },
    { element: 'Éditeur intégré (code ou drag)', tool: 'Monaco Editor / Blockly' },
    { element: 'Résultat en live', tool: 'Output terminal simulé / Iframe résultat' },
    { element: 'Validation automatique', tool: 'Code de test ou script d\'évaluation JS' },
    { element: 'Interface unifiée', tool: 'React (avec Zustand ou Redux si complexe)' },
  ];

  const securityFeatures = [
    {
      icon: '🔒',
      title: 'Biocage de clic droit',
      items: [
        'Interdiction du menu contextuel (clic droit) sur tout le site',
        'Prévention des actions non autorisées'
      ]
    },
    {
      icon: '🔗',
      title: 'Désactivation des liens externes',
      items: [
        'Suppression des liens avec target="_blank"',
        'Redirection interne de tous les liens externes',
        'Interdiction d\'ouverture de nouvelles fenêtres'
      ]
    },
    {
      icon: '👁️',
      title: 'Surveillance de l\'activité',
      items: [
        'Détection de perte de focus (alt+tab, réduction)',
        'Alerte en cas de changement d\'onglet',
        'Journalisation des événements pour analyse'
      ]
    },
    {
      icon: '🚧',
      title: 'Verrouillage des pages',
      items: [
        'Système de route-guard pour navigation contrôlée',
        'Accès limité selon le niveau et la progression',
        'Authentification obligatoire pour les exercices'
      ]
    }
  ];

  const testimonials = [
    { quote: "Mes enfants adorent CodeGenesis, ils progressent chaque semaine sans même s'en rendre compte !", author: "– Amina B., parent" },
    { quote: "Un outil parfait pour suivre et motiver mes élèves. La progression Scratch vers Python est particulièrement bien pensée.", author: "– M. Yassin, enseignant" },
    { quote: "La gamification et l'interface claire ont transformé l'apprentissage du code en jeu pour mon fils. Bravo !", author: "– Youssef T., parent" },
    { quote: "Le tableau de bord parent est très complet. Je peux suivre le temps passé et les progrès réalisés en un coup d'œil.", author: "– Maram S., parent" },
  ];

  const faqs = [
    { q: "Comment m'inscrire ?", a: "Cliquez sur 'Essayer gratuitement' et remplissez le formulaire d'inscription. Vous pouvez choisir entre un compte élève, parent ou enseignant." },
    { q: "Puis-je changer de niveau ?", a: "Oui ! Un test de placement est disponible à tout moment dans votre tableau de bord pour réévaluer votre niveau." },
    { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons les cartes bancaires, les paiements via la Poste Tunisienne, D17 et les virements bancaires." },
    { q: "Est-ce que CodeGenesis est sécurisé pour les enfants ?", a: "Absolument. Nous avons implémenté un environnement cloisonné avec contrôle parental, désactivation des liens externes et conformité RGPD." },
    { q: "Les contenus sont-ils disponibles en arabe ?", a: "Oui, l'interface et tous les contenus sont disponibles en français, arabe et anglais. Vous pouvez changer de langue à tout moment." },
  ];

  return (
    <>
      <style>{css}</style>

      {/* Scroll to top button */}
      <div className={`scroll-top ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop}>
        ↑
      </div>

      {/* Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">Code<span>Genesis</span></div>
        <nav>
          <a href="#features">Fonctionnalités</a>
          <a href="#ux">Scénarios UX</a>
          <a href="#exercises">Exercices</a>
          <a href="#levels">Niveaux</a>
          <a href="#security">Sécurité</a>
          <a href="#pricing">Tarifs</a>
          <a href="#faq">FAQ</a>
          <span className="lang-switch" onClick={() => setLang(l => l === 'FR' ? 'EN' : 'FR')}>
            {lang}
          </span>
          <div className="auth-buttons">
            <button className="btn-sso">SSO</button>
<button
  className="btn-login"
  onClick={() => window.location.href = '/login'}
>
  Connexion
</button>          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero container" ref={heroRef}>
        <div className="hero-text">
          <h1>Apprentissage <span>dynamique</span> & sécurisé<br/>pour les 8–17 ans</h1>
          <p>
            Tutoriels vidéo, quiz interactifs, projets guidés, badges et classements : 
            tout est conçu pour motiver les enfants et adolescents à apprendre la programmation 
            chaque jour dans un environnement sécurisé.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary"onClick={() => window.location.href = '/login'}>
              <span>Essayer gratuitement</span>
            </button>
            <button className="btn-secondary"onClick={() => window.location.href = '/login'}>
              <span>Voir la démo</span>
            </button>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="icon">🎓</div>
              <span>Parcours Scratch → Python</span>
            </div>
            <div className="hero-feature">
              <div className="icon">🌐</div>
              <span>FR · AR · EN</span>
            </div>
            <div className="hero-feature">
              <div className="icon">🔒</div>
              <span>Environnement sécurisé</span>
            </div>
          </div>
        </div>
        <div className="hero-img">
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
            alt="Interface CodeGenesis" 
            className="main-img"
          />
          <img 
            src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Exemple de code" 
            className="floating floating-1"
          />
          <img 
            src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Robot éducatif" 
            className="floating floating-2"
          />
          <img 
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
            alt="Badges et récompenses" 
            className="floating floating-3"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <h2 className="section-title">Fonctionnalités Clés</h2>
        <p className="section-subtitle">
          Découvrez les principales fonctionnalités qui font de CodeGenesis la plateforme idéale 
          pour l'apprentissage interactif de la programmation
        </p>
        <div className="feature-grid container">
          {features.map((f, idx) => (
            <div className="card" key={idx}>
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <div className="tags">
                {f.tags.map((tag, i) => (
                  <span className="tag" key={i}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UX Scenarios */}
      <section id="ux" className="ux-section">
        <h2 className="section-title">Scénarios Utilisateurs</h2>
        <p className="section-subtitle">
          Découvrez comment CodeGenesis s'adapte aux besoins spécifiques des parents et des élèves
        </p>
        <div className="ux-cards container">
          <div className="ux-card">
            <h4><span className="parent-icon">👨‍👩‍👧‍👦</span> Parent</h4>
            <ul>
              <li>Inscription rapide avec configuration du profil enfant</li>
              <li>Choix entre pack gratuit ou premium selon les besoins</li>
              <li>Tableau de bord complet avec badges, temps passé et progression</li>
              <li>Notifications et rapports hebdomadaires par email</li>
              <li>Lancement de "Challenges du week-end" pour motiver l'enfant</li>
              <li>Envoi de messages d'encouragement personnalisés</li>
              <li>Gestion administrative complète (abonnement, paiements)</li>
              <li>Contrôle parental avancé (limites horaires, jours autorisés)</li>
            </ul>
          </div>
          <div className="ux-card">
            <h4><span className="student-icon">👦</span> Élève</h4>
            <ul>
              <li>Personnalisation de l'avatar et choix de la langue</li>
              <li>Questionnaire initial pour évaluer le niveau de départ</li>
              <li>Parcours modulaire de Scratch vers Python</li>
              <li>Défis ludiques, mini-projets et classements amicaux</li>
              <li>Éditeur de code intégré avec feedback instantané</li>
              <li>Badges et récompenses pour chaque étape accomplie</li>
              <li>Publication de projets sur le mur communautaire</li>
              <li>Participation à des défis mensuels thématiques</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Exercises */}
      <section id="exercises" className="exercises-section">
        <h2 className="section-title">Exercices Interactifs</h2>
        <p className="section-subtitle">
          Divers types d'activités pédagogiques pour un apprentissage complet et engageant
        </p>
        <div className="exercises-grid container">
          {interactiveExercises.map((ex, idx) => (
            <div className="exercise-card" key={idx}>
              <div className="exercise-icon">{ex.icon}</div>
              <h4>{ex.title}</h4>
              <p>{ex.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section id="levels" className="levels-section">
        <h2 className="section-title">Niveaux Pédagogiques</h2>
        <p className="section-subtitle">
          Une approche adaptée à chaque tranche d'âge et niveau de compétence
        </p>
        <div className="levels container">
          <div className="level beginner">
            <div className="level-content">
              <h3>Débutant (8–11 ans)</h3>
              <p><strong>Objectif :</strong> Comprendre les bases de manière ludique et sensorielle</p>
              <p><strong>Méthodologie :</strong> Approche visuelle + jeu-guide</p>
              <ol>
                <li>Vidéo interactive animée (3-5 min) résumant les concepts clés</li>
                <li>Jeu d'association (drag & drop, memory) pour ancrer les concepts</li>
                <li>Mission simple à valider (ex: colorier un composant)</li>
                <li>Quiz très court (3 questions) débloquant une récompense</li>
                <li>Classement et badge selon performance et créativité</li>
              </ol>
            </div>
          </div>
          <div className="level inter">
            <div className="level-content">
              <h3>Moyen (11–14 ans)</h3>
              <p><strong>Objectif :</strong> Approfondir la compréhension par la pratique dirigée</p>
              <p><strong>Méthodologie :</strong> Apprentissage par l'erreur + expérimentation contrôlée</p>
              <ol>
                <li>Fiche résumée interactive avec schémas explicatifs</li>
                <li>Exercice guidé pas à pas : compléter ou corriger un programme</li>
                <li>Question "Pourquoi ça marche ?" pour forcer la réflexion</li>
                <li>Mini-projet créatif appliquant les concepts appris</li>
                <li>Classement et badge selon performance et créativité</li>
              </ol>
            </div>
          </div>
          <div className="level advanced">
            <div className="level-content">
              <h3>Avancé (14–17 ans)</h3>
              <p><strong>Objectif :</strong> Développer l'autonomie et la résolution de problèmes</p>
              <p><strong>Méthodologie :</strong> Projets + défis + peer learning</p>
              <ol>
                <li>Fiche de révision condensée (PDF ou interactive)</li>
                <li>Défi avec consigne ouverte (ex: "Crée un mini-jeu avec 3 variables")</li>
                <li>Forum d'échange pour demander de l'aide et commenter</li>
                <li>Éditeur de code intégré avec systèmes de versionnage</li>
                <li>Classement et certificat téléchargeable</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Elements */}
      
      {/* Security Features */}
      <section id="security" className="security-section">
        <h2 className="section-title">Sécurité & Contrôle d'Accès</h2>
        <p className="section-subtitle">
          Garantir un environnement d'apprentissage fermé et sécurisé pour les enfants
        </p>
        <div className="security-grid container">
          {securityFeatures.map((feature, idx) => (
            <div className="security-card" key={idx}>
              <h4><span>{feature.icon}</span> {feature.title}</h4>
              <ul>
                {feature.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Security */}
      <section id="pricing">
        <h2 className="section-title">Tarifs & Sécurité</h2>
        <p className="section-subtitle">
          Des options adaptées à tous les besoins, avec une sécurité renforcée
        </p>
        <div className="info-sections container">
          <div className="info">
            <h3>Monétisation</h3>
            <ul>
              <li>Accès gratuit aux contenus de base</li>
              <li>Abonnements Premium pour contenus avancés</li>
              <li>Packs thématiques disponibles à l'achat</li>
              <li>Paiement par carte bancaire, Poste Tunisienne et D17</li>
              <li>Facturation et gestion d'abonnement intégrée</li>
            </ul>
          </div>
          <div className="info">
            <h3>Sécurité & RGPD</h3>
            <ul>
              <li>Environnement strictement cloisonné</li>
              <li>Route-guards et expiration de session</li>
              <li>Contrôle parental complet</li>
              <li>Gestion RBAC (accès basé sur les rôles)</li>
              <li>Conformité totale avec le RGPD</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <h2 className="section-title">Ils nous font confiance</h2>
        <p className="section-subtitle">
          Découvrez ce que disent les parents, élèves et enseignants de CodeGenesis
        </p>
        <div className="testimonials container">
          {testimonials.map((t, idx) => (
            <div className="testimonial" key={idx}>
              <p>{t.quote}</p>
              <h5>{t.author}</h5>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <h2 className="section-title">Questions Fréquentes</h2>
        <p className="section-subtitle">
          Trouvez les réponses aux questions les plus posées sur CodeGenesis
        </p>
        <div className="faq">
          {faqs.map((f, idx) => (
            <div className="faq-item" key={idx}>
              <div
                className={`faq-question ${openFaq === idx ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {f.q}
                <span>{openFaq === idx ? '−' : '+'}</span>
              </div>
              <div className={`faq-answer ${openFaq === idx ? 'open' : ''}`}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact-section">
        <div className="contact">
          <h3>Contactez notre équipe</h3>
          <form onSubmit={e => { e.preventDefault(); alert('Message envoyé avec succès !'); }}>
            <div className="form-row">
              <input type="text" placeholder="Votre nom" required />
              <input type="email" placeholder="Votre email" required />
            </div>
            <select required>
              <option value="">Sujet de votre message</option>
              <option value="support">Support technique</option>
              <option value="partnership">Partenariat</option>
              <option value="feedback">Feedback & suggestions</option>
              <option value="other">Autre</option>
            </select>
            <textarea placeholder="Votre message" required></textarea>
            <button type="submit">Envoyer le message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4>CodeGenesis</h4>
              <ul>
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#ux">Scénarios UX</a></li>
                <li><a href="#levels">Niveaux</a></li>
                <li><a href="#pricing">Tarifs</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Ressources</h4>
              <ul>
                <li><a href="#">Blog éducatif</a></li>
                <li><a href="#">Tutoriels gratuits</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Centre d'aide</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Légal</h4>
              <ul>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">RGPD</a></li>
                <li><a href="#">Mentions légales</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:contact@codegenesis.com">contact@codegenesis.com</a></li>
                <li><a href="tel:+21612345678">+216 12 345 678</a></li>
                <li>Tunis, Tunisie</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} CodeGenesis – Tous droits réservés. Plateforme éducative interactive pour enfants et adolescents.
          </div>
        </div>
      </footer>
    </>
  );
}