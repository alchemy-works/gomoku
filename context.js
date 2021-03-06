import {
    html,
    createContext,
    createStore,
    Provider,
    createDispatchHook,
    createSelectorHook,
    createStoreHook
} from './modules.js'

export const MAP_56 = {
    '5': '五',
    '6': '六',
}

export const PIECE_COLOR = {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
}

export function toggleColor(color) {
    if (color === PIECE_COLOR.BLACK) {
        return PIECE_COLOR.WHITE
    }
    if (color === PIECE_COLOR.WHITE) {
        return PIECE_COLOR.BLACK
    }
}

export const SIZE_TYPE = {
    SMALL: 15,
    NORMAL: 17,
    LARGE: 19,
}

function isWinner(table, gi, ii, WINNER_COUNT, SIZE) {
    const color = table[gi][ii].color

    function inRange(gi, ii) {
        return gi >= 0 && gi < SIZE && ii >= 0 && ii < SIZE
    }

    function getPieceCount(line) {
        let sum = 1
        for (const fn of line) {
            for (let i = 1; i < WINNER_COUNT; i++) {
                const [ngi, nii] = fn(i)
                if (!inRange(ngi, nii, SIZE)) {
                    break
                }
                if (table[ngi][nii].color !== color) {
                    break
                }
                sum++
            }
        }
        return sum
    }

    const lineVertical = [(i) => [gi + i, ii], (i) => [gi - i, ii]]
    const lineHorizontal = [(i) => [gi, ii + i], (i) => [gi, ii - i]]
    const lineBackslash = [(i) => [gi + i, ii + i], (i) => [gi - i, ii - i]]
    const lineSlash = [(i) => [gi + i, ii - i], (i) => [gi - i, ii + i]]

    return getPieceCount(lineVertical) >= WINNER_COUNT
        || getPieceCount(lineHorizontal) >= WINNER_COUNT
        || getPieceCount(lineBackslash) >= WINNER_COUNT
        || getPieceCount(lineSlash) >= WINNER_COUNT
}

export function getSizeFromSearch() {
    const q = new URLSearchParams(location.search)
    const size = Number(q.get('size'))
    if (size && Number.isInteger(size)) {
        return size
    }
}


function initialTable(size) {
    const length = size
    return Array.from({ length }).map(() => Array.from({ length }).map(() => ({})))
}

const initialState = {
    size: SIZE_TYPE.SMALL,
    table: initialTable(SIZE_TYPE.SMALL),
    tableHistory: [initialTable(SIZE_TYPE.SMALL)],
    currentColor: PIECE_COLOR.BLACK,
    previousColor: '',
    winnerColor: '',
}

const handlers = {
    putPiece5(state, payload = []) {
        const [gi, ii] = payload
        if (state.winnerColor) {
            return state
        }
        if (state.table[gi][ii].color) {
            return state
        }
        const newTable = state.table.map((group, groupIndex) => {
            if (groupIndex !== gi) {
                return group
            } else {
                return group.map((item, itemIndex) => {
                    if (itemIndex !== ii) {
                        return item
                    } else if (!item.color) {
                        return { ...item, color: state.currentColor }
                    } else {
                        return item
                    }
                })
            }
        })
        const newCurrentColor = toggleColor(state.currentColor)
        const newTableHistory = [...state.tableHistory, newTable]
        return {
            ...state,
            table: newTable,
            currentColor: newCurrentColor,
            tableHistory: newTableHistory,
            previousColor: state.currentColor,
            winnerColor: isWinner(newTable, gi, ii, 5, state.size) ? state.currentColor : state.winnerColor,
        }
    },
    putPiece6(state, payload = []) {
        const [gi, ii] = payload
        if (state.winnerColor) {
            return state
        }
        if (state.table[gi][ii].color) {
            return state
        }
        const newTable = state.table.map((group, groupIndex) => {
            if (groupIndex !== gi) {
                return group
            } else {
                return group.map((item, itemIndex) => {
                    if (itemIndex !== ii) {
                        return item
                    } else if (!item.color) {
                        return { ...item, color: state.currentColor }
                    } else {
                        return item
                    }
                })
            }
        })
        const newCurrentColor = (!state.previousColor || state.previousColor === state.currentColor)
            ? toggleColor(state.currentColor)
            : state.currentColor

        const newTableHistory = [...state.tableHistory, newTable]
        return {
            ...state,
            table: newTable,
            currentColor: newCurrentColor,
            previousColor: state.currentColor,
            tableHistory: newTableHistory,
            winnerColor: isWinner(newTable, gi, ii, 6, state.size) ? state.currentColor : state.winnerColor,
        }
    },
    repentanceStep5(state, payload) {
        if (state.tableHistory.length === 1) {
            return state
        }
        const newTableHistory = [...state.tableHistory]
        newTableHistory.pop()
        return {
            ...state,
            table: newTableHistory[newTableHistory.length - 1],
            tableHistory: newTableHistory,
            currentColor: toggleColor(state.currentColor),
            winnerColor: '',
        }
    },
    repentanceStep6(state, payload) {
        if (state.tableHistory.length === 1) {
            return state
        }
        const newTableHistory = [...state.tableHistory]
        newTableHistory.pop()

        let newPreviousColor
        if (newTableHistory.length === 1) {
            newPreviousColor = ''
        } else if (state.previousColor === state.currentColor) {
            newPreviousColor = toggleColor(state.currentColor)
        } else {
            newPreviousColor = state.previousColor
        }

        return {
            ...state,
            table: newTableHistory[newTableHistory.length - 1],
            tableHistory: newTableHistory,
            currentColor: state.previousColor,
            previousColor: newPreviousColor,
            winnerColor: '',
        }
    },
    resetTable(state, payload) {
        return {
            ...state,
            table: initialTable(state.size),
            tableHistory: [initialTable(state.size)],
            currentColor: PIECE_COLOR.BLACK,
            previousColor: '',
            winnerColor: '',
        }
    },
    setSize(state, payload) {
        const size = payload
        return {
            ...state,
            size,
            table: initialTable(size),
            tableHistory: [initialTable(size)],
            currentColor: PIECE_COLOR.BLACK,
            previousColor: '',
            winnerColor: '',
        }
    }
}

function reducer(state = initialState, action = {}) {
    const handler = handlers[action.type]
    if (typeof handler !== 'function') {
        return state
    } else {
        return handler(state, action.payload)
    }
}

const Context = createContext(null)

export const useStore = createStoreHook(Context)
export const useDispatch = createDispatchHook(Context)
export const useSelector = createSelectorHook(Context)

const store = createStore(reducer)

export function ContextProvider({ children }) {
    return html`
        <${Provider} context=${Context} store=${store}>
            ${children}
        </Provider>
    `
}