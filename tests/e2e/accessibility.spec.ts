import { expect, test } from "@playwright/test";

test("garment picker supports standard radio-group keyboard navigation", async ({ page }) => {
  await page.goto("/taisymas");

  const shirts = page.getByRole("radio", {
    name: "Marškiniai Ilgomis rankovėmis, sagomis arba be jų",
    exact: true,
  });
  const tshirts = page.getByRole("radio", {
    name: "Marškinėliai Trumpomis rankovėmis, trikotažas",
    exact: true,
  });
  await shirts.focus();
  await page.keyboard.press("ArrowRight");

  await expect(tshirts).toBeChecked();
  await expect(tshirts).toBeFocused();
});

test("mobile menu keeps keyboard focus inside the dialog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Meniu" }).click();
  const dialog = page.getByRole("dialog", { name: "Meniu" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Kaip veikia" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Pradėti taisymą" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("link", { name: "Kaip veikia" })).toBeFocused();
});
