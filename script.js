document.documentElement.classList.add('js')

const menuButton = document.querySelector('.menu-toggle')
const mobileMenu = document.querySelector('.mobile-menu')
const mobileLinks = mobileMenu.querySelectorAll('a')
const navLinks = document.querySelectorAll('.nav-link')
const revealItems = document.querySelectorAll('.reveal')
const sections = document.querySelectorAll('main section[id]')
const progressBar = document.querySelector('.scroll-progress span')
const lightbox = document.querySelector('#lightbox')
const lightboxImage = document.querySelector('#lightbox-image')
const lightboxCaption = document.querySelector('#lightbox-caption')
const lightboxClose = document.querySelector('.lightbox-close')
const currentYear = document.querySelector('#current-year')

currentYear.textContent = new Date().getFullYear()

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.setAttribute('aria-label', '打开菜单')
  mobileMenu.classList.remove('open')
  document.body.classList.remove('menu-open')
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true'
  if (isOpen) {
    closeMenu()
    return
  }

  menuButton.setAttribute('aria-expanded', 'true')
  menuButton.setAttribute('aria-label', '关闭菜单')
  mobileMenu.classList.add('open')
  document.body.classList.add('menu-open')
})

mobileLinks.forEach((link) => link.addEventListener('click', closeMenu))

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu()
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu()
})

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      revealObserver.unobserve(entry.target)
    })
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
)

revealItems.forEach((item) => revealObserver.observe(item))

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const id = entry.target.id
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
      })
    })
  },
  { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
)

sections.forEach((section) => navObserver.observe(section))

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0
  progressBar.style.width = `${Math.min(progress * 100, 100)}%`
}

window.addEventListener('scroll', updateScrollProgress, { passive: true })
updateScrollProgress()

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img')
    lightboxImage.src = image.src
    lightboxImage.alt = image.alt
    lightboxCaption.textContent = button.dataset.caption || image.alt
    document.body.classList.add('lightbox-open')
    lightbox.showModal()
  })
})

function closeLightbox() {
  lightbox.close()
  document.body.classList.remove('lightbox-open')
  lightboxImage.src = ''
}

lightboxClose.addEventListener('click', closeLightbox)
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox()
})
lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'))
