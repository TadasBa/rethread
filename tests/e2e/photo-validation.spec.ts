import { expect, test } from "@playwright/test";

test("rejects photo formats that the API cannot accept", async ({ page }) => {
  await page.goto("/taisymas");
  await page.getByRole("radio", { name: /Kelnės/ }).click();
  await page.getByRole("button", { name: /^Trumpinimas\s+15 €$/ }).click();
  await page.getByRole("link", { name: "Tęsti į užsakymą" }).click();

  await page.locator("#f-photos").setInputFiles({
    name: "repair.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("GIF89a"),
  });

  await expect(page.locator(".photos .field__error")).toContainText("Nepalaikomas nuotraukos formatas");
  await expect(page.locator(".photos__item")).toHaveCount(0);
});
