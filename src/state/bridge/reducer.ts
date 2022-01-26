import { createReducer } from '@reduxjs/toolkit'
import { Field, resetBridgeState, typeInput } from './actions'

export interface BridgeState {
  readonly independentField: Field
  readonly typedValue: string
}

const initialState: BridgeState = {
  independentField: Field.BRIDGE_TOKENSPX,
  typedValue: '',
}

export default createReducer<BridgeState>(initialState, (builder) =>
  builder
    .addCase(resetBridgeState, () => initialState)
    .addCase(typeInput, (state, { payload: { field, typedValue} }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
        otherTypedValue: '',
      }
    }),
)
