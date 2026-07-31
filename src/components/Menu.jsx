import { Photo } from './Photo.jsx'

/**
 * Menu prices come from CMS-edited JSON as free text, so they aren't
 * always a clean decimal: ranges ("8.50 / 13.50"), prefixed ("from 3.00"),
 * or blank ("Ask at the bar"). Format each case instead of blindly
 * prepending €, which previously produced "€from 3.00" and a bare "€".
 */
function formatMenuPrice(raw) {
  const value = (raw ?? '').toString().trim()
  if (!value) return null

  if (value.includes('/')) {
    return value
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `€${part}`)
      .join(' / ')
  }

  const fromMatch = value.match(/^from\s+(.+)$/i)
  if (fromMatch) {
    return `From €${fromMatch[1].trim()}`
  }

  return `€${value}`
}

const COURSE_SIZES = '(min-width: 860px) 45vw, 92vw'

export function Menu({ venue }) {
  const { menu } = venue
  const canOrder = Boolean(venue.ordering?.enabled)

  // The bar is pulled out of the ordinary flow and rendered on forest green:
  // it reads as a different room because it is one, and it gives the long
  // menu a definite end rather than trailing off.
  const barSection = menu.sections.find((section) => section.id === 'drinks')
  const foodSections = menu.sections.filter((section) => section.id !== 'drinks')
  return (
    <section id="menu" className="section section--loose menu" data-reveal>
      {/* Intro and photo side by side. This absorbed the old standalone Room
          section — the two were saying overlapping things one after the other,
          and the fire photo belongs with the copy that describes the room. */}
      <div className="menu__intro-grid">
        <div className="section__intro menu__intro-copy">
          {menu.eyebrow ? <p className="eyebrow">{menu.eyebrow}</p> : null}
          <h2 className="section__title">{menu.title}</h2>
          {/* Split on blank lines so the CMS field stays a plain textarea:
              staff press return twice, they don't learn a syntax. */}
          {String(menu.intro || '')
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((para) => (
              <p className="section__body" key={para}>
                {para}
              </p>
            ))}
          {canOrder ? (
            <p className="menu__order-link">
              <a className="text-link" href="#order-list">Order pizza for collection →</a>
            </p>
          ) : null}
        </div>

        {menu.introPhoto?.base ? (
          <figure className="menu__intro-figure">
            <Photo
              base={menu.introPhoto.base}
              alt={menu.introPhoto.alt || ''}
              sizes="(min-width: 860px) 46vw, 92vw"
            />
          </figure>
        ) : null}
      </div>

      <div className="menu__courses">
        {foodSections.map((section) => (
          <div className="menu__course" id={section.id} key={section.id}>
            {section.base ? (
              <figure className="menu__course-figure">
                <Photo base={section.base} alt={section.alt || ''} sizes={COURSE_SIZES} />
              </figure>
            ) : null}

            <div className="menu__course-body">
              <div className="menu__course-head">
                <h3 className="menu__section-title">{section.name}</h3>
                {section.note ? <p className="menu__course-note">{section.note}</p> : null}
              </div>
              <MenuList items={section.items} />
            </div>
          </div>
        ))}
      </div>

      {barSection ? (
        <div className="menu__bar" id={barSection.id}>
          <div className="menu__course">
            {barSection.base ? (
              <figure className="menu__course-figure">
                <Photo base={barSection.base} alt={barSection.alt || ''} sizes={COURSE_SIZES} />
              </figure>
            ) : null}
            <div className="menu__course-body">
              <div className="menu__course-head">
                <h3 className="menu__section-title">{barSection.name}</h3>
                {barSection.note ? <p className="menu__course-note">{barSection.note}</p> : null}
              </div>
              <MenuList items={barSection.items} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MenuList({ items }) {
  return (
    <ul className="menu__list">
      {items.map((item) => {
        const price = formatMenuPrice(item.price)
        // replaceAll, not replace: range prices carry two euro signs, and the
        // single-replace version announced the Cheesy Pizza Garlic Bread as
        // "euro 8.50 / €13.50".
        const spokenPrice = price ? price.replaceAll('€', 'euro ') : null
        return (
          <li className="menu__item" key={item.name}>
            <div className="menu__item-main">
              <span className="menu__item-name">{item.name}</span>
              {price ? (
                <span className="menu__item-price" aria-label={spokenPrice}>
                  {price}
                </span>
              ) : null}
            </div>
            {item.description ? <p className="menu__item-desc">{item.description}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
