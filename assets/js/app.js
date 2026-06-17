const cl = console.log;

const postForm = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const bodyControl = document.getElementById('body');
const userIdControl = document.getElementById('userId');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const postContainer = document.getElementById('postContainer');
const spinner = document.getElementById('spinner');

let BASE_URL = `https://jsonplaceholder.typicode.com`;
let POST_URL = `${BASE_URL}/posts`;

function snackBar(msg, icon) {
    Swal.fire({
        icon: icon,
        title: msg,
        timer: 3000
    });
}

function tooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function makeApiCall(methodName, api_url, body = null, successCb,erroCb) {

    spinner.classList.remove('d-none');

    body = body ? JSON.stringify(body) : null;

    let xhr = new XMLHttpRequest();

    xhr.open(methodName, api_url);

    xhr.setRequestHeader(
        "Content-Type",
        "application/json; charset=UTF-8"
    );

    xhr.send(body);

    xhr.onload = function () {

        spinner.classList.add('d-none');

        if (xhr.status >= 200 && xhr.status <= 299) {

            let res = xhr.response ? JSON.parse(xhr.response) : {};

            if (methodName === 'GET' && Array.isArray(res)) {
                successCb(res.reverse());
            }
            else if (methodName === 'POST') {
                let obj = {
                    ...JSON.parse(body),
                    id: res.id
                };
                successCb(obj);
            }
            else if (
                methodName === 'GET' ||
                methodName === 'PATCH' ||
                methodName === 'PUT'
            ) {
                successCb(res);
            }
            else {
                successCb();
            }

        } else {
            erroCb(xhr)
        }
    };

    xhr.onerror = function () {
        spinner.classList.add('d-none');
        snackBar('Network Error !!!', 'error');
    };
}

function createPost(arr) {

    let result = '';

    arr.forEach(p => {

        result += `
            <div class="col-md-3 mb-3" id="${p.id}">
                <div class="card h-100">

                    <div class="card-header"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="${p.title}">

                        <h3>${p.title}</h3>
                    </div>

                    <div class="card-body">
                        <p>${p.body}</p>
                    </div>

                    <div class="card-footer d-flex justify-content-between">


                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                         onclick="onEdit(this)"
                            data-toggle="tooltip"
                            title="Edit Post"></i>
                        <i class="fa-solid fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"
                            data-toggle="tooltip"
                            title="Delete Post"></i>

                    </div>
                </div>
            </div>
        `;
    });

    postContainer.innerHTML = result;

    tooltips();
}

makeApiCall('GET', POST_URL, null, createPost,snackBar);

function onSubmitPost(e) {

    e.preventDefault();

    let postObj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };

    makeApiCall('POST', POST_URL, postObj,singlePostCb,snackBar);
}

function singlePostCb(res) {

    let card = document.createElement('div');

    card.className = 'col-md-3 mb-3';
    card.id = res.id;

    card.innerHTML = `
        <div class="card h-100">

            <div class="card-header"
                data-toggle="tooltip"
                title="${res.title}">
                <h3>${res.title}</h3>
            </div>

            <div class="card-body">
                <p>${res.body}</p>
            </div>

            <div class="card-footer d-flex justify-content-between">

                        <i class="fa-solid fa-pen-to-square fa-2x text-primary"
                         onclick="onEdit(this)"
                            data-toggle="tooltip"
                            title="Edit Post"></i>
                        <i class="fa-solid fa-trash-can fa-2x text-danger"
                        onclick="onRemove(this)"
                            data-toggle="tooltip"
                            title="Delete Post"></i>

            </div>
        </div>
    `;

    postContainer.prepend(card);

    postForm.reset();

    tooltips();

    snackBar(
        `New Post with Id ${res.id} is Created`,
        'success'
    );
}

function onRemove(ele) {

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {

        if (result.isConfirmed) {

            let REMOVE_ID =
                ele.closest('.col-md-3').id;

            localStorage.setItem(
                'REMOVE_ID',
                REMOVE_ID
            );

            let removeUrl =
                `${BASE_URL}/posts/${REMOVE_ID}`;

            makeApiCall('DELETE',removeUrl,null,removeCb,snackBar);
        }
    });
}

function removeCb() {

    let REMOVE_ID =
        localStorage.getItem('REMOVE_ID');

    document.getElementById(REMOVE_ID).remove();

    localStorage.removeItem('REMOVE_ID');

    snackBar(
        `Post ${REMOVE_ID} Deleted Successfully`,
        'success'
    );
}

function onEdit(ele) {

    let EDIT_ID =
        ele.closest('.col-md-3').id;

    localStorage.setItem('EDIT_ID',EDIT_ID);

    let editUrl = `${BASE_URL}/posts/${EDIT_ID}`;

    makeApiCall('GET',editUrl,null,editCb,snackBar);
}

function editCb(res) {

    titleControl.value = res.title;
    bodyControl.value = res.body;
    userIdControl.value = res.userId;

    addBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');

    postForm.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function onUpdate() {

    let UPDATE_ID =
        localStorage.getItem('EDIT_ID');

    let updateUrl =
        `${BASE_URL}/posts/${UPDATE_ID}`;

    let updateObj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };

    makeApiCall('PATCH',updateUrl, updateObj, updateCb,snackBar);
}

function updateCb(res) {

    let UPDATE_ID =localStorage.getItem('EDIT_ID');

    let col = document.getElementById(UPDATE_ID);

    col.querySelector('.card-header h3').innerHTML = res.title;

    col.querySelector('.card-body p').innerHTML = res.body;

    let header =col.querySelector('.card-header');

    $(header).tooltip('dispose');

    header.setAttribute(
        'title',
        res.title
    );

    $(header).tooltip();

    postForm.reset();

    addBtn.classList.remove('d-none');
    updateBtn.classList.add('d-none');

    localStorage.removeItem('EDIT_ID');

    snackBar( `Post ${res.id} Updated Successfully`,'success');

    col.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

postForm.addEventListener('submit',onSubmitPost
);

updateBtn.addEventListener('click',onUpdate);