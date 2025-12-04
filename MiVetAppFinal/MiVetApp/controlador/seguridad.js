// ---- Sesión ----
export function getUsuarioActual() {
  try {
    const raw = localStorage.getItem('veterinaryUser');
    console.log('Usuario actual en localStorage:', raw);  // Verifica si se obtiene correctamente el usuario
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error leyendo usuario de localStorage', e);
    return null;
  }
}

// Normaliza cualquier rol (para evitar fallos por mayúsculas/minúsculas)
function normalizarRol(rol) {
  return (rol || '').toString().trim().toLowerCase();
}

// Obtiene el rol real del usuario sin importar si viene como rolNombre o rol
function getRolUsuario(user) {
  return normalizarRol(user?.rolNombre || user?.rol);
}

export function requireLogin(rolesPermitidos = null) {
  const user = getUsuarioActual();

  // Si no hay sesión → fuera
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  // Rol real del usuario
  const rolUser = getRolUsuario(user);

  // Si tiene restricciones de rol
  if (rolesPermitidos && rolesPermitidos.length) {
    const permitidos = rolesPermitidos.map(normalizarRol);

    if (!permitidos.includes(rolUser)) {
      alert('Acceso restringido.');
      window.location.href = 'login.html';
      return null;
    }
  }

  return user;
}

// Helpers
export function isAdmin(user) {
  return getRolUsuario(user) === 'administrador';
}
export function isVet(user) {
  return getRolUsuario(user) === 'veterinario';
}
export function isRecep(user) {
  return getRolUsuario(user) === 'recepcionista';
}

// ---- Permisos ----
export function puedeVerCuentas(user) {
  return isAdmin(user);
}
export function puedeEditarCuentas(user) {
  return isAdmin(user);
}
export function puedeProgramarCitas(user) {
  const rol = getRolUsuario(user);
  return rol === 'administrador' || rol === 'recepcionista';
}
export function puedeVerMisCitas(user) {
  return isVet(user);
}

// ---- Logout ----
export function logout() {
  console.log('Cerrando sesión...');  // Verifica si la función logout se está ejecutando
  localStorage.removeItem('veterinaryUser');
  window.location.href = 'login.html';
}

export function wireLogout(selector = '.btn-logout') {
  document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll(selector);
    console.log('Botones encontrados:', btns); // Verifica si el selector encuentra los botones

    btns.forEach(el => {
      el.addEventListener('click', (e) => {
        console.log('Clic en el botón de logout'); // Verifica si el clic se detecta
        e.preventDefault();
        logout();
      });
    });
  });
}

// ---- UI por rol ----
export function initRoleUI(userParam = null) {
  const user = userParam || getUsuarioActual();
  if (!user) return;

  const rolOriginal = user.rolNombre || user.rol || 'Sin rol';
  const rolLower    = getRolUsuario(user);
  const correo      = user.user || user.correo || '';

  document.addEventListener('DOMContentLoaded', () => {

    // chip de usuario
    const indicator = document.querySelector('[data-user-indicator]');
    if (indicator) {
      indicator.textContent = `${rolOriginal} | ${correo}`;
    }

    // menú lateral usando data-roles
    document.querySelectorAll('[data-roles]').forEach(link => {
      const rolesStr = link.getAttribute('data-roles') || '';
      const roles = rolesStr.split(',').map(normalizarRol).filter(Boolean);

      if (roles.length && !roles.includes(rolLower)) {
        link.style.display = 'none';
      } else {
        link.style.display = '';
      }
    });

    // Ajuste especial para linkMascotas
    const linkMascotas = document.querySelector('#linkMascotas');
    if (linkMascotas) {
      if (isVet(user)) {
        linkMascotas.href = 'mis_mascotas.html';
        linkMascotas.innerHTML = `
          <i class="fa-solid fa-dog"></i>
          <span class="nav-text">Mis mascotas</span>
        `;
      } else {
        linkMascotas.href = 'mascotas.html';
        linkMascotas.innerHTML = `
          <i class="fa-solid fa-dog"></i>
          <span class="nav-text">Mascotas</span>
        `;
      }
    }
  });
}
