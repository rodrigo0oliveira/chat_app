const getUserIdFromToken = () => {
    const token = localStorage.getItem('chat_token');
    if (!token) return null;
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.id;
    } catch {
        return null;
    }
};

const getChatToken = () => {
    return localStorage.getItem('chat_token');
}

const setChatToken = (token: string) => {
    localStorage.setItem('chat_token', token);
}

const removeChatToken = () => {
    localStorage.removeItem('chat_token');
}

export const tokenService = {
    getUserIdFromToken,
    getChatToken,
    setChatToken,
    removeChatToken
}