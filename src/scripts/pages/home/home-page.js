import { createHomePageTemplate } from "../../templates/templates.js";
import {
  getAccessToken,
  parseJwt,
  capitalizeEachWord,
} from "../../utils/auth.js";

class HomePage {
  render() {
    const token = getAccessToken();
    return createHomePageTemplate();
  }

  async afterRender() {
  }
}

export default HomePage;
