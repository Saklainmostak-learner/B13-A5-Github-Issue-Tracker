const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const providedUser = {
    username: "admin",
    password: "admin123",
};
if (localStorage.getItem("isloggedIn") === "true") {
    window.location.href = "./home.html";
}
loginForm.addEventListener("submit", function (a) {
    a.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (username === providedUser.username && password === providedUser.password){
        localStorage.setItem("isLoggedIn","true");
        window.location.href="./home.html";
    }else{
        alert("go to hell");
    }
})