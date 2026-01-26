from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

def test_login_gestion_associative(driver):
    driver.get("http://localhost:3001/")

    driver.find_element(By.ID, "email").send_keys("admin@example.com")
    driver.find_element(By.ID, "password").send_keys("admin123")
    driver.find_element(By.ID, "password").send_keys(Keys.ENTER)

    assert "dashboard" in driver.current_url.lower()
