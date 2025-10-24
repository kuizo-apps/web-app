import { Chart, registerables } from "chart.js";
import * as Api from "../../data/api.js";
import {
  createReportPageTemplate,
  createReportSkeletonTemplate,
} from "../../templates/templates.js";
import { parseActivePathname } from "../../routes/url-parser.js";
import ReportPresenter from "./report-presenter.js";
import Swal from "sweetalert2";

// Daftarkan semua komponen Chart.js
Chart.register(...registerables);

class ReportPage {
  render() {
    return createReportSkeletonTemplate();
  }

  async afterRender() {
    const url = parseActivePathname();
    const roomId = url.id;

    this._presenter = new ReportPresenter({
      view: this,
      model: Api,
    });

    this._presenter.loadReport(roomId);
  }

  showLoading() {
    document.querySelector(".main-content").innerHTML =
      createReportSkeletonTemplate();
  }

  showReport(data) {
    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = createReportPageTemplate(data);

    // DIUBAH: Pengecekan dilakukan di sini.
    // Hanya panggil _renderChart jika ujiannya adaptif.
    const isAdaptive =
      data.room_info.assessment_mechanism.startsWith("adaptive");
    if (isAdaptive) {
      this._renderChart(data);
    }
  }

  _renderChart(data) {
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color")
      .trim();

    const hexToRgba = (hex, alpha = 0.2) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const primaryColorTransparent = hexToRgba(primaryColor);

    this._renderAdaptiveChart(
      data.history,
      primaryColor,
      primaryColorTransparent
    );
  }

  _renderAdaptiveChart(history, color, bgColor) {
    const ctx = document
      .getElementById("adaptivePerformanceChart")
      .getContext("2d");
    const labels = history.map((_, index) => `${index + 1}`);
    const difficultyData = history.map((item) => item.level_at_attempt); // Menggunakan level_at_attempt
    const levelTextMap = { 1: "Mudah", 2: "Sedang", 3: "Sulit" };

    const isMobile = window.innerWidth < 768;

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Level Kesulitan Soal",
            data: difficultyData,
            borderColor: color,
            backgroundColor: bgColor,
            fill: true,
            pointBackgroundColor: color,
            pointRadius: isMobile ? 2 : 4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0.5,
            max: 3.5,
            ticks: {
              stepSize: 0.5,
              display: false,
            },
            title: { display: false, text: "Level Kesulitan" },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          x: {
            title: {
              display: true,
              text: "Urutan Soal",
              padding: { top: 10, bottom: 10 },
            },
            ticks: {
              callback: function (value, index, ticks) {
                if (isMobile && history.length > 20) {
                  const label = this.getLabelForValue(value);
                  return parseInt(label) % 5 === 0 ? label : "";
                }
                return this.getLabelForValue(value);
              },
            },
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: false,
            text: "Perkembangan Kesulitan Soal (Adaptif)",
            font: { size: 16, family: "Poppins" },
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => `Soal ke-${tooltipItems[0].label}`,
              label: () => null,
              afterBody: (context) => {
                const level = context[0].parsed.y;
                return `Level Kesulitan ${
                  levelTextMap[level] || "Tidak diketahui"
                }`;
              },
            },
          },
        },
      },
    });
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Gagal Memuat Laporan",
      text: message,
      confirmButtonColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim(),
    });
    document.querySelector(
      ".main-content"
    ).innerHTML = `<p class="error-message">${message}</p>`;
  }
}

export default ReportPage;
