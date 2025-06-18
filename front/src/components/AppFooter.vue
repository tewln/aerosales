<template>
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-brand">
            <p class="footer-description">
                <img id="logo-img"src="http://localhost:3000/uploads/icons/logo.png">Аэросэйлс</img>
            </p>
            </div>

            <div class="footer-links">
            <div class="footer-column">
                <h3 class="footer-title">Контакты</h3>
                <ul>
                <li><a href="tel:+88888888888">+8 (888) 888-88-88</a></li>
                <li><a href="mailto:nothing@tosee.here">nothing@tosee.here</a></li>
                <li>г. Челябинск, пр. Ленина, 76</li>
                </ul>
            </div>

            <div class="footer-column">
                <h3 class="footer-title">Соцсети</h3>
                <div class="social-links">
                <a href="#"><img src="http://localhost:3000/uploads/icons/tele.png" alt="Telegram"></a>
                <a href="#"><img src="http://localhost:3000/uploads/icons/vk.png" alt="VK"></a>
                </div>
            </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.site-footer {
  background: #2c3e50;
  color: white;
  padding: 2rem;
  text-align: center;
  position: relative;
  margin-top: auto;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-brand {
  margin-left: 80px;
  flex: 1 1 200px;

  .footer-description {
    display: flex;
    align-items: center;
    opacity: 0.8;
    line-height: 1.5;
  }
}

#logo-img {
    max-width: 64px;
}

.footer-links {
  flex: 2 1 600px;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-column {
  flex: 1 1 200px;
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #fff;
  }
  ul {
    list-style: none;
    padding: 0;
    li {
      margin-bottom: 0.5rem;
      a {
        color: #bdc3c7;
        text-decoration: none;
        transition: color 0.3s;
        &:hover {
          color: #3498db;
        }
      }
    }
  }
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  img {
    width: 32px;
    height: 32px;
    opacity: 0.7;
    transition: opacity 0.3s;
    &:hover {
      opacity: 1;
    }
  }
}

.footer-bottom {
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
  background: rgba(0, 0, 0, 0.2);
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .site-footer {
    padding: 1.5rem 1rem;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .footer-brand {
    margin-left: 0;
    text-align: center;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .footer-column {
    text-align: center;
  }
  
  .social-links {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
  
  #logo-img {
    max-width: 48px;
  }
}

@media (max-width: 480px) {
  .site-footer {
    padding: 1rem 0.5rem;
  }
  
  .footer-container {
    gap: 1rem;
  }
  
  .footer-column h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  .footer-column ul li {
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  
  .social-links img {
    width: 28px;
    height: 28px;
  }
  
  #logo-img {
    max-width: 40px;
  }
  
  .footer-description {
    font-size: 0.9rem;
  }
}
</style>