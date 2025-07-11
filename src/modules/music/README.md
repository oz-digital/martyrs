# Music Module

## Задачи
1. Отрефачить карточку ArtistCardSmall - декомпозировать пропс artist, заменить ArtistCard на ArtistCardSmall и оставить только ArtistCard.
2. Кнопка проигрывания должна показывать паузу на треке только если это текущий трек!

### Оптимизация подсчета воспроизведений
- [ ] Перенести увеличение playCount из HTTP stream controller в WebSocket handler
- [ ] Сейчас playCount увеличивается при каждом HTTP range request, что может давать завышенные показатели
- [ ] WebSocket handler уже написан, но не работает из-за проблем с регистрацией модуля