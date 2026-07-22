import { expect, test, type Page } from "@playwright/test";

async function chooseTrouserShortening(page: Page): Promise<void> {
  await page.goto("/taisymas");
  await page.getByRole("radio", { name: /Kelnės/ }).click();
  await page.getByRole("button", { name: /^Trumpinimas\s+15 €$/ }).click();
}

async function openPopulatedOrder(page: Page): Promise<void> {
  await chooseTrouserShortening(page);
  await page.getByRole("link", { name: "Tęsti į užsakymą" }).click();
  await expect(page).toHaveURL(/\/uzsakymas$/);
}

async function fillRequiredFields(page: Page): Promise<void> {
  await page.getByLabel(/^Vardas/).fill("Austėja");
  await page.getByLabel(/^El\. paštas/).fill("austeja@example.com");
  await page.getByLabel(/Sutinku, kad su manimi/).check();
}

test("carries an estimate into the order form and restores it after reload", async ({ page }) => {
  await openPopulatedOrder(page);

  await expect(page.getByRole("heading", { name: "Užsakymo užklausa" })).toBeVisible();
  await expect(page.locator(".ordersum__garment")).toContainText("Kelnės");
  await expect(page.locator(".ordersum__line")).toContainText("Trumpinimas");
  await expect(page.locator(".ordersum__totals")).toContainText("15 €");

  await page.reload();
  await expect(page.locator(".ordersum__line")).toContainText("Trumpinimas");
});

test("validates required customer details before submitting", async ({ page }) => {
  await openPopulatedOrder(page);
  await page.getByRole("button", { name: "Pateikti užklausą" }).click();

  await expect(page.getByText("Įrašykite vardą")).toBeVisible();
  await expect(page.getByText("Įrašykite teisingą el. paštą")).toBeVisible();
  await expect(page.getByText(/Reikia jūsų sutikimo/)).toBeVisible();
  await expect(page.getByLabel(/^Vardas/)).toBeFocused();
});

test("submits trusted IDs and resets the estimate after success", async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route("**/api/order", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await openPopulatedOrder(page);
  await fillRequiredFields(page);
  await page.getByRole("button", { name: "Pateikti užklausą" }).click();

  await expect(page.getByRole("heading", { name: "Užklausa gauta — ačiū!" })).toBeVisible();
  expect(submitted).toMatchObject({
    garmentId: "trousers",
    repairIds: ["shortening"],
    name: "Austėja",
    email: "austeja@example.com",
    consent: true,
  });
  expect(submitted).not.toHaveProperty("totalPrice");

  await page.goto("/taisymas");
  await expect(page.locator(".worksheet__empty")).toBeVisible();
});

test("keeps the form and estimate available when submission fails", async ({ page }) => {
  await page.route("**/api/order", (route) =>
    route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "email_failed" }) }),
  );

  await openPopulatedOrder(page);
  await fillRequiredFields(page);
  await page.getByRole("button", { name: "Pateikti užklausą" }).click();

  await expect(page.locator(".orderform__status")).toContainText("Nepavyko išsiųsti");
  await expect(page.getByRole("button", { name: "Pateikti užklausą" })).toBeEnabled();
  await expect(page.locator(".ordersum__line")).toContainText("Trumpinimas");
});
