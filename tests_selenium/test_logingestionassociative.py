from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_login_gestion_associative(driver):
    driver.get("http://localhost:3001/")

    wait = WebDriverWait(driver, 15)

    # Attendre que les champs soient présents
    email = wait.until(EC.presence_of_element_located((By.ID, "email")))
    password = wait.until(EC.presence_of_element_located((By.ID, "password")))

    email.clear()
    email.send_keys("admin@example.com")
    password.clear()
    password.send_keys("admin123")

    # 1) Essayer submit via ENTER
    password.send_keys(Keys.ENTER)

    # 2) Attendre une preuve de succès : changement d'URL (OU un élément de l'app post-login)
    try:
        wait.until(lambda d: d.current_url != "http://localhost:3001/")
    except Exception:
        # Si ça n'a pas bougé, essaye de cliquer sur un bouton "Se connecter" si existant
        # (adapte le sélecteur si ton bouton a un autre texte)
        buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Se connecter') or contains(., 'Connexion') or contains(., 'Login')]")
        if buttons:
            buttons[0].click()
            wait.until(lambda d: d.current_url != "http://localhost:3001/")

    # À ce stade, on vérifie la page attendue.
    # Si ta route n'est pas /dashboard, adapte ici (ex: /home, /associations, etc.)
    assert "dashboard" in driver.current_url.lower() or "home" in driver.current_url.lower()
