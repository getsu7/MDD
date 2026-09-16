import { Browser, BrowserContext, Page, expect, test } from '@playwright/test';

/**
 * Parcours utilisateur complet MDD, couvrant les 9 scénarios attendus :
 * inscription, connexion, abonnement, fil, publication,
 * commentaire, désabonnement, profil, déconnexion.
 */

const timestamp = Date.now();
const user = {
  username: `e2e_${timestamp}`,
  email: `e2e_${timestamp}@example.test`,
  password: 'Abcdefg1!',
};

let topicTitle = '';
let articleTitle = '';
let articleUrl = '';

test.describe.serial('Parcours utilisateur complet', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('1. Inscription', async () => {
    await page.goto('/');
    await page.getByRole('link', { name: "S'inscrire" }).click();

    await page.locator('input[formcontrolname="username"]').fill(user.username);
    await page.locator('input[formcontrolname="email"]').fill(user.email);
    await page.locator('input[formcontrolname="password"]').fill(user.password);
    await page.getByRole('button', { name: "S'inscrire" }).click();

    await expect(page).toHaveURL(/\/articles$/);
  });

  test('2. Connexion (après déconnexion)', async () => {
    await page.goto('/articles');
    await page.getByRole('button', { name: 'Se déconnecter' }).first().click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('link', { name: 'Se connecter' }).click();
    await page.locator('input[formcontrolname="identifier"]').fill(user.username);
    await page.locator('input[formcontrolname="password"]').fill(user.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/articles$/);
  });

  test('3. Abonnement à un thème', async () => {
    await page.goto('/topics');

    const firstCard = page.locator('.topic-card').first();
    await expect(firstCard).toBeVisible();
    topicTitle = (await firstCard.locator('.topic-card__title').innerText()).trim();

    await firstCard.getByRole('button', { name: "S'abonner" }).click();
    await expect(firstCard.getByText('Déjà abonné')).toBeVisible();
  });

  test('4. Consultation du fil et tri', async () => {
    await page.goto('/articles');
    await expect(page.locator('app-header')).toBeVisible();

    const sortButton = page.locator('.feed__sort');
    await sortButton.click();
    await expect(sortButton).toBeVisible();
  });

  test('5. Publication d’un article', async () => {
    await page.goto('/articles/create');

    articleTitle = `Article e2e ${timestamp}`;
    await page.locator('select[formcontrolname="topicId"]').selectOption({ index: 1 });
    await page.locator('input[formcontrolname="title"]').fill(articleTitle);
    await page
      .locator('textarea[formcontrolname="content"]')
      .fill('Contenu généré par le test end-to-end Playwright.');

    await page.getByRole('button', { name: 'Créer' }).click();

    await expect(page).toHaveURL(/\/articles\/\d+$/);
    articleUrl = page.url();
    await expect(page.locator('.article-detail__title')).toHaveText(articleTitle);
  });

  test('6. Commentaire sur l’article créé', async () => {
    await page.goto(articleUrl);

    const commentContent = 'Super article, merci pour le partage !';
    await page.getByPlaceholder('Écrivez ici votre commentaire').fill(commentContent);
    await page.getByRole('button', { name: 'Envoyer le commentaire' }).click();

    await expect(page.locator('.comments__content').last()).toHaveText(commentContent);
  });

  test('7. Désabonnement du thème', async () => {
    await page.goto('/profile');

    const subscriptionCard = page.locator('.subscription-card', { hasText: topicTitle });
    await expect(subscriptionCard).toBeVisible();
    await subscriptionCard.getByRole('button', { name: 'Se désabonner' }).click();

    await expect(subscriptionCard).toHaveCount(0);
  });

  test('8. Modification du profil', async () => {
    await page.goto('/profile');

    const newUsername = `${user.username}_edit`;
    await page.locator('input[formcontrolname="username"]').fill(newUsername);
    await page.getByRole('button', { name: 'Sauvegarder' }).click();

    await expect(page.locator('input[formcontrolname="username"]')).toHaveValue(newUsername);
    user.username = newUsername;
  });

  test('9. Déconnexion et protection des routes', async () => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Se déconnecter' }).first().click();

    await expect(page).toHaveURL(/\/$/);

    await page.goto('/articles');
    await expect(page).toHaveURL(/\/login/);
  });
});
