import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
function getDateConditions(date) {
  if (date) {
    const dateString = date.toString(); // Just to ensure it's a string
    const day = parseInt(dateString.substring(0, 2), 10);
    const month = parseInt(dateString.substring(2, 4), 10) - 1; // months are 0-based in JavaScript
    const year = parseInt(dateString.substring(4, 8), 10);
    const customDate = new Date(year, month, day);
    customDate.setHours(0, 0, 0, 0); // Set the start of the day
    const customDateEnd = new Date(year, month, day);
    customDateEnd.setHours(23, 59, 59, 999); // Set the end of the day
    return [{ $match: { 'date.start': { $gte: customDate, $lte: customDateEnd } } }];
  } else {
    return [];
  }
}
function getPeriodConditions(period, periodStart, periodEnd) {
  const now = new Date();
  let startDate, endDate;
  if (periodStart && periodEnd) {
    startDate = new Date(periodStart);
    endDate = new Date(periodEnd);
    return [
      {
        $match: {
          'date.start': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ];
  } else if (period) {
    startDate = new Date(now.getTime()); // Make a copy
    endDate = new Date(now.getTime()); // New end date variable
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        endDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        endDate.setDate(now.getDate() + 30); // Or endDate.setMonth(now.getMonth() + 1); based on your requirement
        break;
      case 'year':
        endDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        break;
    }
    return [
      {
        $match: {
          'date.start': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ];
  } else {
    return [];
  }
}
function getPhaseConditions(phase) {
  const now = new Date();
  const todayStart = new Date(now.getTime());
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now.getTime());
  todayEnd.setHours(23, 59, 59, 999);
  let matchConditions = [];
  switch (phase) {
    case 'finished':
      matchConditions.push({ 'date.start': { $lt: now } });
      break;
    case 'today':
      matchConditions.push({ 'date.start': { $gte: todayStart, $lte: todayEnd } });
      break;
    case 'live':
      matchConditions.push({ 'date.start': { $lte: now } });
      matchConditions.push({ 'date.end': { $gte: now } });
      break;
    case 'planned':
      matchConditions.push({ 'date.start': { $gt: now } });
      break;
    default:
      break;
  }
  if (matchConditions && matchConditions.length > 0) {
    return [{ $match: { $and: matchConditions } }];
  } else {
    return [];
  }
}
function getTicketsLookupStage() {
  return {
    $lookup: {
      from: 'tickets',
      localField: '_id',
      foreignField: 'target',
      as: 'tickets',
      pipeline: [
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
      ],
    },
  };
}
function getParticipantsPhotosStage() {
  return {
    $addFields: {
      participantsPhotos: {
        $map: {
          input: '$tickets',
          as: 'ticket',
          in: '$$ticket.user.profile.photo',
        },
      },
    },
  };
}
function getNumberOfTicketsStage() {
  return {
    $addFields: {
      numberOfTickets: { $size: '$tickets' },
    },
  };
}
function getHasTicketStage(user) {
  if (user) {
    return [
      {
        $addFields: {
          hasTicket: {
            $in: [new ObjectId(user), '$tickets.user._id'],
          },
        },
      },
    ];
  } else {
    return [];
  }
}
function getProjectStage() {
  return {
    $project: {
      _id: 1,
      url: 1,
      cover: 1,
      name: 1,
      phase: 1,
      description: 1,
      content: 1,
      owner: 1,
      creator: 1,
      tags: 1,
      date: 1,
      numberOfTickets: 1,
      participantsPhotos: 1,
      special: 1,
      specialData: 1,
      hasTicket: 1,
      tickets: 1,
      createdAt: 1,
    },
  };
}
function getParticipantStages(participantQuery) {
  const participantId = participantQuery ? new ObjectId(participantQuery) : null;
  let stages = [];
  if (participantId) {
    stages.push({
      $addFields: {
        participantTickets: {
          $filter: {
            input: '$tickets',
            as: 'ticket',
            cond: { $eq: ['$$ticket.user._id', participantId] },
          },
        },
      },
    });
    stages.push({
      $match: {
        'participantTickets.0': { $exists: true },
      },
    });
  }
  return stages;
}
export {
  getDateConditions,
  getHasTicketStage,
  getNumberOfTicketsStage,
  getParticipantsPhotosStage,
  getParticipantStages,
  getPeriodConditions,
  getPhaseConditions,
  getProjectStage,
  getTicketsLookupStage,
};
export default {
  getDateConditions,
  getPhaseConditions,
  getPeriodConditions,
  getTicketsLookupStage,
  getParticipantsPhotosStage,
  getNumberOfTicketsStage,
  getHasTicketStage,
  getProjectStage,
  getParticipantStages,
};
