import './style.css'

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
const mobileMenuClose = document.getElementById('mobile-menu-close')
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link')

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open')
    document.body.style.overflow = 'hidden'
  })

  mobileMenuClose?.addEventListener('click', () => {
    mobileMenu.classList.remove('open')
    document.body.style.overflow = ''
  })

  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open')
      document.body.style.overflow = ''
    })
  })
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item')

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question')
  const answer = item.querySelector('.faq-answer')

  question?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open')

    // Close all other items
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('open')
      }
    })

    // Toggle current item
    item.classList.toggle('open', !isOpen)
  })
})

// Smooth scroll for anchor links (fallback for older browsers)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href')
    if (href === '#') return

    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})

// Header scroll effect with shrink
const header = document.getElementById('header')
const heroPhone = document.getElementById('hero-phone')
let lastScroll = 0
let ticking = false

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScroll = window.pageYOffset

      // Header effects
      if (currentScroll > 50) {
        header?.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-sm', 'header-shrink')
        header?.classList.remove('bg-white')
      } else {
        header?.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-sm', 'header-shrink')
        header?.classList.add('bg-white')
      }

      // Parallax effect on hero phone (subtle float up)
      if (heroPhone && currentScroll < 800) {
        const translateY = currentScroll * -0.08
        heroPhone.style.transform = `translateY(${translateY}px)`
      }

      lastScroll = currentScroll
      ticking = false
    })
    ticking = true
  }
})

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('opacity-100', 'translate-y-0')
      entry.target.classList.remove('opacity-0', 'translate-y-8')
    }
  })
}, observerOptions)

// Observe all animated elements
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out')
  observer.observe(el)
})
