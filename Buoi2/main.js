const API_URL = 'http://localhost:3000';
const POSTS_URL = `${API_URL}/posts`;
const COMMENTS_URL = `${API_URL}/comments`;

// --- Generic Helper Functions ---

async function fetchJson(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function getNextId(url) {
    const items = await fetchJson(url);
    if (!items || items.length === 0) {
        return "1";
    }
    const maxId = Math.max(...items.map(p => parseInt(p.id) || 0));
    return (maxId + 1).toString();
}

async function softDelete(url, id, callback) {
    const patched = await fetchJson(`${url}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });
    if (patched && callback) callback();
}

async function restoreItem(url, id, callback) {
    const patched = await fetchJson(`${url}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false })
    });
    if (patched && callback) callback();
}

// --- Posts Logic ---

async function GetData() {
    const posts = await fetchJson(POSTS_URL);
    if (!posts) return;

    const bodyTable = document.getElementById('body-table');
    bodyTable.innerHTML = '';
    posts.forEach(post => {
        bodyTable.innerHTML += convertPostToHTML(post);
    });
}

async function Save() {
    const idInput = document.getElementById("id_txt");
    const titleInput = document.getElementById("title_txt");
    const viewsInput = document.getElementById("views_txt");

    let id = idInput.value.trim();
    const title = titleInput.value;
    const views = viewsInput.value;

    if (!id) {
        id = await getNextId(POSTS_URL);
    }

    // Check if exists to determine Update (PUT) vs Create (POST)
    // Note: We use PUT for update to replace content, but we need to preserve isDeleted if strict replacement.
    // However, usually PATCH is safer for updates if we only modify specific fields.
    // Here we stick to logic: if exists, PUT (replace), if not, POST.

    // Better strategy: Try to GET.
    const existing = await fetchJson(`${POSTS_URL}/${id}`);

    const payload = {
        id: id,
        title: title,
        views: views,
        isDeleted: existing ? (existing.isDeleted || false) : false
    };

    const method = existing ? "PUT" : "POST";
    const url = existing ? `${POSTS_URL}/${id}` : POSTS_URL;

    await fetchJson(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // Clear form
    idInput.value = '';
    titleInput.value = '';
    viewsInput.value = '';

    GetData();
    return false;
}

function convertPostToHTML(post) {
    const isDeleted = post.isDeleted;
    const deletedStyle = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
    const actionButton = isDeleted
        ? `<input type='button' value='Restore' onclick='Restore("${post.id}")'>`
        : `<input type='button' value='Delete' onclick='Delete("${post.id}")'>`;

    return `<tr ${deletedStyle}>
    <td>${post.id}</td>
    <td>${post.title}</td>
    <td>${post.views}</td>
    <td>${actionButton}</td>
    </tr>`;
}

async function Delete(id) {
    await softDelete(POSTS_URL, id, GetData);
}

async function Restore(id) {
    await restoreItem(POSTS_URL, id, GetData);
}

// --- Comments Logic ---

async function GetComments() {
    const comments = await fetchJson(COMMENTS_URL);
    if (!comments) return;

    const bodyTable = document.getElementById('comments-body-table');
    bodyTable.innerHTML = '';
    comments.forEach(comment => {
        bodyTable.innerHTML += convertCommentToHTML(comment);
    });
}

async function SaveComment() {
    const idInput = document.getElementById("comment_id_txt");
    const textInput = document.getElementById("comment_text_txt");
    const postIdInput = document.getElementById("comment_postId_txt");

    let id = idInput.value.trim();
    const text = textInput.value;
    const postId = postIdInput.value;

    if (!id) {
        id = await getNextId(COMMENTS_URL);
    }

    const existing = await fetchJson(`${COMMENTS_URL}/${id}`);

    const payload = {
        id: id,
        text: text,
        postId: postId,
        isDeleted: existing ? (existing.isDeleted || false) : false
    };

    const method = existing ? "PUT" : "POST";
    const url = existing ? `${COMMENTS_URL}/${id}` : COMMENTS_URL;

    await fetchJson(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // Clear form
    idInput.value = '';
    textInput.value = '';
    postIdInput.value = '';

    GetComments();
    return false;
}

function convertCommentToHTML(comment) {
    const isDeleted = comment.isDeleted;
    const deletedStyle = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
    const actionButton = isDeleted
        ? `<input type='button' value='Restore' onclick='RestoreComment("${comment.id}")'>`
        : `<input type='button' value='Delete' onclick='DeleteComment("${comment.id}")'>`;

    return `<tr ${deletedStyle}>
    <td>${comment.id}</td>
    <td>${comment.text}</td>
    <td>${comment.postId}</td>
    <td>${actionButton}</td>
    </tr>`;
}

async function DeleteComment(id) {
    await softDelete(COMMENTS_URL, id, GetComments);
}

async function RestoreComment(id) {
    await restoreItem(COMMENTS_URL, id, GetComments);
}

// Initialize
GetData();
GetComments();