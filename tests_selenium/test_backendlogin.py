from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

def test_backend_login(driver):
    driver.get("http://localhost:8000/admin/login/?next=/admin/")

    driver.find_element(By.ID, "id_username").send_keys("admin@example.com")
    driver.find_element(By.ID, "id_password").send_keys("admin123")
    driver.find_element(By.ID, "id_password").send_keys(Keys.ENTER)

    assert "/admin/" in driver.current_url
