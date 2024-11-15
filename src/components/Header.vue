<script setup>

</script>

<template>
    <header class="">

        <div>
            <b-navbar toggleable="lg" type="dark" variant="info">
                <b-navbar-brand :to="{ name: 'Home' }">Dados Geodésicos</b-navbar-brand>

                <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

                <b-collapse id="nav-collapse" is-nav>

                    <b-navbar-nav>
                        <b-nav-item :to="{ name: 'Home' }">Inicio</b-nav-item>
                        <b-nav-item :to="{ name: 'Login' }">Login</b-nav-item>
                    </b-navbar-nav>

                </b-collapse>
            </b-navbar>
        </div>

    </header>
</template>