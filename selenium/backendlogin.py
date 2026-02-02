from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time


def main():
    options = Options()
    options.add_argument("--start-maximized")
    # options.add_argument("--headless")  # optionnel

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    try:
        driver.get("http://localhost:8000/admin/")

        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.ID, "id_username")))

        driver.find_element(By.ID, "id_username").send_keys("admin@example.com")
        driver.find_element(By.ID, "id_password").send_keys("admin123")
        driver.find_element(By.ID, "id_password").send_keys(Keys.ENTER)

        wait.until(lambda d: "/admin/" in d.current_url)

        print("✅ LOGIN ADMIN OK")
        time.sleep(3)

    except Exception as e:
        print("❌ ERREUR SELENIUM")
        print(e)

    finally:
        driver.quit()


if __name__ == "__main__":
    main()
