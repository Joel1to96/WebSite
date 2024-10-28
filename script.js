// script.js

let familiasData = []; // Array para almacenar los datos organizados
let menuItemsContainer = document.getElementById('menu-items');
let sidebarMenu = document.getElementById('sidebar-menu');

fetch('menu.json')
    .then(response => response.json())
    .then(data => {
        familiasData = []; // Reiniciar la variable

        // Organizar los artículos por familias y subfamilias utilizando arrays
        data.forEach(item => {
            const familiaNombre = item.Familia;
            const ordenFamilia = parseInt(item.OrdenFamilia) || 999;
            const subfamiliaNombre = item.Subfamilia || null;
            const ordenSubfamilia = parseInt(item.OrdenSubfamilia) || 999;
            const ordenArticulo = parseInt(item.OrdenArticulo) || 999;

            // Buscar o crear la familia
            let familia = familiasData.find(f => f.nombre === familiaNombre);
            if (!familia) {
                familia = {
                    nombre: familiaNombre,
                    orden: ordenFamilia,
                    subfamilias: [],
                    articulos: []
                };
                familiasData.push(familia);
            }

            if (subfamiliaNombre) {
                // Buscar o crear la subfamilia
                let subfamilia = familia.subfamilias.find(s => s.nombre === subfamiliaNombre);
                if (!subfamilia) {
                    subfamilia = {
                        nombre: subfamiliaNombre,
                        orden: ordenSubfamilia,
                        articulos: []
                    };
                    familia.subfamilias.push(subfamilia);
                }
                // Añadir el artículo a la subfamilia
                subfamilia.articulos.push({
                    ...item,
                    orden: ordenArticulo
                });
            } else {
                // Añadir el artículo directamente a la familia
                familia.articulos.push({
                    ...item,
                    orden: ordenArticulo
                });
            }
        });

        // Ordenar las familias
        familiasData.sort((a, b) => a.orden - b.orden);

        // Generar la barra lateral con las familias
        familiasData.forEach(familia => {
            const familiaLi = document.createElement('li');
            const familiaLink = document.createElement('a');
            familiaLink.href = "#";
            familiaLink.textContent = familia.nombre;
            familiaLink.dataset.familia = familia.nombre;
            familiaLink.classList.add('familia-link');
            familiaLi.appendChild(familiaLink);

            if (familia.subfamilias.length === 0) {
                // La familia no tiene subfamilias
                familiaLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    cargarArticulos(familia.nombre, null);
                });
            } else {
                // La familia tiene subfamilias
                // Ordenar las subfamilias
                familia.subfamilias.sort((a, b) => a.orden - b.orden);

                // Contenedor para las subfamilias (inicialmente oculto)
                const subfamiliasUl = document.createElement('ul');
                subfamiliasUl.classList.add('subfamilias-list');
                subfamiliasUl.style.display = 'none'; // Oculto por defecto

                familiaLi.appendChild(subfamiliasUl);

                // Event listener para desplegar las subfamilias
                familiaLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const subfamiliasList = e.target.nextElementSibling;
                    const isDisplayed = subfamiliasList.style.display === 'block';
                    // Ocultar todas las subfamilias
                    document.querySelectorAll('.subfamilias-list').forEach(ul => ul.style.display = 'none');
                    // Ocultar todas las familias activas
                    document.querySelectorAll('.familia-link.active').forEach(link => link.classList.remove('active'));
                    // Mostrar u ocultar la subfamilia seleccionada
                    if (!isDisplayed) {
                        subfamiliasList.style.display = 'block';
                        e.target.classList.add('active');
                    }
                });

                // Añadir las subfamilias al contenedor
                familia.subfamilias.forEach(subfamilia => {
                    const subfamiliaLi = document.createElement('li');
                    const subfamiliaLink = document.createElement('a');
                    subfamiliaLink.href = "#";
                    subfamiliaLink.textContent = subfamilia.nombre;
                    subfamiliaLink.dataset.familia = familia.nombre;
                    subfamiliaLink.dataset.subfamilia = subfamilia.nombre;
                    subfamiliaLink.classList.add('subfamilia-link');
                    subfamiliaLi.appendChild(subfamiliaLink);
                    subfamiliasUl.appendChild(subfamiliaLi);

                    // Event listener para cargar los artículos al hacer clic
                    subfamiliaLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        cargarArticulos(familia.nombre, subfamilia.nombre);
                    });
                });
            }

            sidebarMenu.appendChild(familiaLi);
        });
    })
    .catch(error => {
        console.error('Error al cargar el menú:', error);
    });

// Función para cargar y mostrar los artículos de una subfamilia o familia
function cargarArticulos(familiaNombre, subfamiliaNombre) {
    menuItemsContainer.innerHTML = ''; // Limpiar contenido anterior

    let familia = familiasData.find(f => f.nombre === familiaNombre);
    let articulos = [];
    let titulo = '';

    if (subfamiliaNombre) {
        let subfamilia = familia.subfamilias.find(s => s.nombre === subfamiliaNombre);
        articulos = subfamilia.articulos.slice(); // Copiar el array
        titulo = `${familiaNombre} - ${subfamiliaNombre}`;
    } else {
        articulos = familia.articulos.slice(); // Copiar el array
        titulo = familiaNombre;
    }

    if (articulos.length > 0) {
        // Ordenar los artículos
        articulos.sort((a, b) => a.orden - b.orden);

        const tituloElemento = document.createElement('h3');
        tituloElemento.textContent = titulo;
        menuItemsContainer.appendChild(tituloElemento);

        const itemsDiv = document.createElement('div');
        itemsDiv.classList.add('menu-items');

        articulos.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');

            const imagenSrc = `imagenes/${item.Imagen}`;

            menuItem.innerHTML = `
                <div class="image-container">
                    <img src="${imagenSrc}" alt="${item.Artículo}">
                </div>
                <h5>${item.Artículo}</h5>
                <p class="precio">${parseFloat(item.Precio).toFixed(2)} €</p>
            `;

            itemsDiv.appendChild(menuItem);
        });

        menuItemsContainer.appendChild(itemsDiv);
    } else {
        menuItemsContainer.innerHTML = '<p>No hay artículos disponibles en esta categoría.</p>';
    }
}
