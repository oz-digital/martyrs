# Music Module

## Задачи

### Оптимизация подсчета воспроизведений
- [ ] Перенести увеличение playCount из HTTP stream controller в WebSocket handler
- [ ] Сейчас playCount увеличивается при каждом HTTP range request, что может давать завышенные показатели
- [ ] WebSocket handler уже написан, но не работает из-за проблем с регистрацией модуля