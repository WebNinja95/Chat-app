

document.addEventListener('DOMContentLoaded', async () => {
    let userLoggedIn;
    
    fetch('/api/prof/datas')
        .then(response => response.json())
        .then(data => {
            userLoggedIn = data.user;
            console.log(userLoggedIn);
            document.getElementById('username').innerHTML = userLoggedIn.userName;
            document.getElementById('fullname').innerHTML = userLoggedIn.fullName;
            document.getElementById('profile-image').src = userLoggedIn.profilePic;
        })
        .catch(error => console.error('Error fetching user data:', error));

        document.getElementById('profile-image-input').addEventListener('change', async function(event) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            document.getElementById('profile-image').src = imageUrl;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/api/profile/save-image', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (!data.success) {
                    console.error('Error uploading image:', data.message);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        const back_btn = document.getElementById('back-btn');
        back_btn.addEventListener('click',function(){
            window.location.href = `/`;
        })
});