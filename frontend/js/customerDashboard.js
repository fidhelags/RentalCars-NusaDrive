const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'customer') {
    window.location.href = '../index.html';
}

const API_CARS = 'http://localhost:3000/api/cars';

function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

async function loadCars() {
    try {
        const res = await fetch(API_CARS);
        const cars = await res.json();
        const grid = document.getElementById('carsGrid');

        if (cars.length === 0) {
            grid.innerHTML = '<p style="color:#9CA3AF;">Belum ada mobil tersedia.</p>';
            return;
        }

        grid.innerHTML = cars.map(car => {
            const tersedia = car.status === 'tersedia';
            const imgSrc = car.gambar ? `../assets/cars/${car.gambar}` : '';

            return `
                <div class="car-card">
                    <div class="car-card-img-placeholder" id="img-wrap-${car.id}">
                        ${imgSrc
                            ? `<img src="${imgSrc}" alt="${car.nama}" style="width:100%;height:180px;object-fit:cover;" onerror="document.getElementById('img-wrap-${car.id}').innerHTML='Foto tidak tersedia'" />`
                            : 'Foto tidak tersedia'
                        }
                    </div>
                    <div class="car-card-body">
                        <div class="car-card-name">${car.nama}</div>
                        <div class="car-card-info">${car.plat} | ${car.kursi} Kursi</div>
                        <div class="car-card-price">${formatRupiah(car.tarif_per_hari)}/hari</div>
                        <button
                            class="btn-sewa"
                            onclick="sewaMobil('${car.id}')"
                        >
                            Sewa
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
    }
}

function sewaMobil(carId) {
    window.location.href = `payment.html?id=${carId}`;
}

loadCars();