import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export const formatDate = (rawDate: string): string =>
  format(new Date(rawDate), 'dd MMM yyyy', {
    locale: ptBR,
  }).replace(/[a-z]{1}/, (letter) => letter.toLowerCase())
