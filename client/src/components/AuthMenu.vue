<script setup>
const toggleMenu = () => {
    document.getElementById("signon").classList.toggle("hidden");
}
</script>

<template>
    <div id="auth-menu">
        <button class="btn btn-profile" @click="toggleMenu"><font-awesome-icon icon="user" /></button>
        <div id="signon" class="hidden">
            <!-- <div class="g-signin2" data-onsuccess="onSignIn"></div> -->
            <a>Logout</a>
        </div>
    </div>
</template>
