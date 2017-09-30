import { TevennecLitePage } from './app.po';

describe('tevennec-lite App', () => {
  let page: TevennecLitePage;

  beforeEach(() => {
    page = new TevennecLitePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
