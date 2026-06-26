import { expect, test } from '@playwright/test'

test('homepage and catalog stay reachable', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /Trouvez votre prochain vehicule/i }),
  ).toBeVisible()

  await page.getByRole('link', { name: /Voir le catalogue/i }).first().click()

  await expect(page).toHaveURL(/\/vehicles/)
  await expect(page.getByRole('heading', { name: /Catalogue/i })).toBeVisible()
})
