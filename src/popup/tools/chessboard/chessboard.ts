import ChessboardToolPane from '@/popup/tools/chessboard/ChessboardToolPane.vue'

export default {
  name: 'Chessboard',
  description: 'A chessboard layout image',
  commandLong: 'chess',
  commandShort: null,
  toolPane: ChessboardToolPane,
  validator: (cmd: string) => false,
  executor: null,
}
