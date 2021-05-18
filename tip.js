import { html, render, styled, useEffect, useState } from './modules.js'

export const TIP_TYPE = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
}

const Tip = styled.div`
  position: absolute;
  font-size: 72px;
  z-index: 1;
  font-weight: 700;
  color: white;
  transition: opacity 300ms;
  cursor: default;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.10);
  
  ${props => {
    if (props.visible) {
      return styled.css`
        opacity: 1;
      `
    } else {
      return styled.css`
        opacity: 0;
      `
    }
  }}
  ${props => {
    switch (props.type) {
      case TIP_TYPE.LEFT:
        return styled.css`
          left: 40px;
          top: 40px;
        `
      case TIP_TYPE.RIGHT:
        return styled.css`
          right: 40px;
          top: 40px;
        `
    }
  }}
`

function FadeTip(props) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setVisible(false)
        }, 1000)
    }, [])

    if (props.type === TIP_TYPE.RIGHT) {
        return html`
            <${Tip} type=${TIP_TYPE.RIGHT} visible=${visible}>咚</Tip>
        `
    }

    if (props.type === TIP_TYPE.LEFT) {
        return html`
            <${Tip} type=${TIP_TYPE.LEFT} visible=${visible}>啪</Tip>
        `
    }
    return ''
}

export function showTip(type, element) {
    const div = document.createElement('div')
    element.insertAdjacentElement('afterbegin', div)
    render(html`
        <${FadeTip} type=${type} />
    `, div)
    setTimeout(() => {
        div.remove()
    }, 1300)
}