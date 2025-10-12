import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import createFriendlyURL from '@martyrs/src/modules/core/controllers/utils/seo-friendly-url.js';
import integrationStripe from '@martyrs/src/modules/integrations/stripe/controllers/services/stripe.service.js';
import { Types } from 'mongoose';
import queryProcessor from './utils/queryProcessor.js';
const ObjectId = { Types }.Types.ObjectId;
const middlewareFactory = db => {
  const Ticket = db.ticket;
  const Event = db.event;
  const Membership = db.membership;
  const serviceStripe = new integrationStripe();
  const read = async (req, res) => {
    console.log('req is', req.query);
    let stages = [];
    stages = [
      ...queryProcessorCore.getSearchOptions(req.query.search, {
        fields: ['name'],
      }),
      ...queryProcessorCore.getBasicOptions(req.query),
      ...queryProcessor.getDateConditions(req.query.date),
      ...queryProcessor.getPeriodConditions(req.query.period, req.query.periodStart, req.query.periodEnd),
      ...queryProcessor.getPhaseConditions(req.query.phase),
      // Tickets and Participants
      queryProcessor.getTicketsLookupStage(),
      queryProcessor.getParticipantsPhotosStage(),
      queryProcessor.getNumberOfTicketsStage(),
      ...queryProcessor.getHasTicketStage(req.query.user),
      ...queryProcessor.getParticipantStages(req.query.participant),
      // For creator
      queryProcessorCore.getCreatorUserLookupStage(),
      queryProcessorCore.getCreatorOrganizationLookupStage(),
      // For owner
      queryProcessorCore.getOwnerUserLookupStage(),
      queryProcessorCore.getOwnerOrganizationLookupStage(),
      queryProcessorCore.getAddFieldsCreatorOwnerStage(),
      // Get object
      // queryProcessor.getProjectStage(),
      // Pagination
      ...queryProcessorCore.getSortingOptions(req.query.sortParam, req.query.sortOrder),
      ...queryProcessorCore.getPaginationOptions(req.query.skip, req.query.limit),
    ];
    try {
      const events = await Event.aggregate(stages).exec();
      res.status(200).send(events);
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        message: err,
      });
    }
  };
  const create = async (req, res) => {
    delete req.body._id;
    try {
      req.body.url = createFriendlyURL(req.body.name);
      let event = new Event(req.body);
      if (!event) {
        return res.status(404).send({ message: 'Event is not created.' });
      }
      if (event.ticketsTypes && event.ticketsTypes.length > 0) {
        const stripeProducts = await serviceStripe.createProducts(event._id.toString(), event.ticketsTypes, event.name);
        event.ticketsTypes = event.ticketsTypes.map((ticket, index) => ({
          ...ticket,
          stripeProductId: stripeProducts[index].productId,
          stripePriceId: stripeProducts[index].priceId,
          stripePaymentLinkId: stripeProducts[index].paymentLinkId,
          link: stripeProducts[index].paymentLink,
        }));
      }
      await event.save();
      res.status(200).send(event);
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        message: err.message,
      });
    }
  };
  const update = async (req, res) => {
    try {
      let existingEvent = await Event.findOne({ url: req.body.url });
      if (!existingEvent) {
        return res.status(404).send({
          message: 'Event not found.',
        });
      }
      if (req.body.ticketsTypes && req.body.ticketsTypes.length > 0) {
        const stripeUpdates = await serviceStripe.updateProducts(existingEvent._id.toString(), req.body.ticketsTypes, existingEvent.ticketsTypes || [], req.body.name);
        req.body.ticketsTypes = req.body.ticketsTypes.map(ticket => {
          const stripeData = stripeUpdates.find(update => update.name === ticket.name);
          return {
            ...ticket,
            stripeProductId: stripeData?.productId,
            stripePriceId: stripeData?.priceId,
            stripePaymentLinkId: stripeData?.paymentLinkId,
            link: stripeData?.paymentLink || ticket.link,
          };
        });
      } else {
        req.body.ticketsTypes = [];
      }
      await Event.updateOne({ _id: existingEvent._id }, { $set: req.body });
      res.status(200).send(req.body);
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        message: err.message,
      });
    }
  };
  const deleteMethod = async (req, res) => {
    try {
      const event = await Event.findOne({ _id: req.body._id });
      if (!event) {
        return res.status(404).send({
          message: 'Event not found.',
        });
      }
      if (event.ticketsTypes && event.ticketsTypes.length > 0) {
        await serviceStripe.deactivateProduct(event._id.toString());
      }
      await Event.deleteOne({ _id: req.body._id });
      res.status(200).send(event);
    } catch (err) {
      return res.status(500).send({
        message: err.message,
      });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteMethod,
  };
};
export default middlewareFactory;
