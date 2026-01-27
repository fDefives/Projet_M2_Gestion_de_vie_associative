from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


def test_login_gestion_associative(driver):
    driver.get("http://localhost:3001/")

    wait = WebDriverWait(driver, 15)

    # champs login visibles
    email = wait.until(EC.presence_of_element_located((By.ID, "email")))
    password = wait.until(EC.presence_of_element_located((By.ID, "password")))

    email.clear()
    email.send_keys("admin@example.com")

    password.clear()
    password.send_keys("admin123")

    # ❗ ENTER pas fiable → clic explicite
    login_button = wait.until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//button[contains(., 'Se connecter') or contains(., 'Connexion') or contains(., 'Login')]"
        ))
    )
    login_button.click()

    # ✅ preuve de succès : le formulaire disparaît
    try:
        wait.until(EC.invisibility_of_element_located((By.ID, "email")))
    except TimeoutException:
        raise AssertionError("❌ Le formulaire de login est toujours visible → login KO")
