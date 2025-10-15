import { createNotFoundPageTemplate } from "../templates/templates";

class NotFoundPage {
  render() {
    return createNotFoundPageTemplate();
  }

  async afterRender() {}
}

export default NotFoundPage;
