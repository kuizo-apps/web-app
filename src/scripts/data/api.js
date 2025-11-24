import { API_CONFIG } from "../config.js";
import { getAccessToken } from "../utils/auth.js";

const ENDPOINTS = {
  LOGIN: `${API_CONFIG.BASE_URL}/login`,
  MY_ROOMS: `${API_CONFIG.BASE_URL}/my-rooms`,
  STUDENT_REPORT: `${API_CONFIG.BASE_URL}/student-reports`,
  JOIN_ROOM: `${API_CONFIG.BASE_URL}/rooms-join`,
  WAITING_ROOM: `${API_CONFIG.BASE_URL}/rooms-participants`,
  LEAVE_ROOM: `${API_CONFIG.BASE_URL}/rooms-leave`,
  START_EXAM: `${API_CONFIG.BASE_URL}/exam-start`,
  ANSWER_NEXT: `${API_CONFIG.BASE_URL}/exam-next`,
  GET_QUESTION: `${API_CONFIG.BASE_URL}/exam-question`,
  GET_RESULT: `${API_CONFIG.BASE_URL}/exam-result`,
  FINISH_EXAM: `${API_CONFIG.BASE_URL}/exam-finish`,
};

export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login gagal. Silakan coba lagi.");
    } catch (e) {
      if (response.status === 400 || response.status === 401) {
        throw new Error("Email atau password yang Anda masukkan salah.");
      }
      throw new Error(
        `Terjadi kesalahan pada server (Status: ${response.status})`
      );
    }
  }
  return response.json();
}

export async function getMyRooms(params) {
  const token = getAccessToken();
  if (!token) throw new Error("Akses token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.MY_ROOMS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal mengambil data ruangan.");
  }
  return response.json();
}

export async function getQuestionDetail(roomId, questionId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(`${ENDPOINTS.GET_QUESTION}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room_id: roomId, question_id: questionId }),
  });

  if (!response.ok) throw new Error("Gagal memuat soal.");
  return response.json();
}

export async function getStudentReport(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(`${ENDPOINTS.STUDENT_REPORT}/${roomId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Gagal memuat laporan (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function joinRoom(keypass) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.JOIN_ROOM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ keypass }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Gagal bergabung ke room (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function getWaitingRoomDetails(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(`${ENDPOINTS.WAITING_ROOM}/${roomId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Gagal memuat data waiting room (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function leaveRoom(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(`${ENDPOINTS.LEAVE_ROOM}/${roomId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Gagal keluar dari room (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function startExam(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.START_EXAM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room_id: roomId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Gagal memulai ujian (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function answerAndNext(payload) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.ANSWER_NEXT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Gagal mengirim jawaban (Status: ${response.status})`
    );
  }
  return response.json();
}

export async function finishExam(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");
  const response = await fetch(ENDPOINTS.FINISH_EXAM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room_id: roomId }),
  });
  if (!response.ok) throw new Error("Gagal menyelesaikan ujian.");
  return response.json();
}

export async function getResult(roomId) {
  const token = getAccessToken();
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(`${ENDPOINTS.GET_RESULT}/${roomId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Gagal memuat hasil (Status: ${response.status})`
    );
  }
  return response.json();
}
