import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl';
import { apiService } from '../../_services';
import { EditUserTimesheetDay, CreateUserTimesheetDay } from '../../Dialogs/UserTimesheetDay';

const useStyles = makeStyles(theme => ({
  mainCalendar: {
    width: '100%',
    marginRight: '45px',
  },
}));

// To tylko wpis!
function UserCalendarComp(props) {
  const classes = useStyles();
  const localizer = momentLocalizer(moment);
  const [calendarState, setCalendarState] = useState({
    view: Views.WEEK,
  });
  const [activeWorkScheduleDayList, setActiveWorkScheduleDay] = useState([]);
  const [myEventsList, setMyEventsList] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userTimesheetDayId, setUserTimesheetDayId] = useState(0);
  const [createdSelection, setCreatedSelection] = useState({ start: null, end: null });

  const prepareDataEvent = (dayData) => {
    if (dayData.dayStartTime === null) {
      return {
        id: dayData.id,
        allDay: true,
        title: dayData.presenceType.name,
        start: moment(`${dayData.userWorkScheduleDay.dayDefinition.id}`).toDate(),
        end: moment(`${dayData.userWorkScheduleDay.dayDefinition.id}`).toDate(),
      };
    }
    return {
      id: dayData.id,
      title: dayData.presenceType.name,
      start: moment(`${dayData.userWorkScheduleDay.dayDefinition.id} ${dayData.dayStartTime}:00`)
        .toDate(),
      end: moment(`${dayData.userWorkScheduleDay.dayDefinition.id} ${dayData.dayEndTime}:00`)
        .toDate(),
    };
  };

  useEffect(
    () => {
      apiService.get('user_timesheet_days?_order[name]=asc&userTimesheet.owner.username=admin')
        .then((result) => {
          const userTimesheetDayList = [];
          result['hydra:member'].forEach((userTimesheetDay) => {
            userTimesheetDayList[prepareDataEvent(userTimesheetDay).id] = prepareDataEvent(
              userTimesheetDay,
            );
          });

          setMyEventsList(userTimesheetDayList);
        });

      apiService.get('users/activeWorkSchedule')
        .then((result) => {
          const scheduleDays = {};
          result.forEach((day) => {
            const dayId = day.dayDefinition.id;

            scheduleDays[dayId] = {
              ...day,
              dayStartTimeFromDate: day.dayStartTimeFrom !== null
                ? new Date(`${dayId}T${day.dayStartTimeFrom}:00`)
                : null,
              dayStartTimeToDate: day.dayStartTimeTo !== null
                ? new Date(`${dayId}T${day.dayStartTimeTo}:00`)
                : null,
              dayEndTimeFromDate: day.dayEndTimeFrom !== null
                ? new Date(`${dayId}T${day.dayEndTimeFrom}:00`)
                : null,
              dayEndTimeToDate: day.dayEndTimeTo !== null
                ? new Date(`${dayId}T${day.dayEndTimeTo}:00`)
                : null,
            };
          });

          setActiveWorkScheduleDay(scheduleDays);
        });
    },
    [],
  );

  const customDayPropGetter = (date) => {
    const dateString = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    if (calendarState.view !== Views.MONTH || !activeWorkScheduleDayList[dateString]) {
      return {};
    }

    if (activeWorkScheduleDayList[dateString].workingDay) {
      return {
        className: 'working-day',
        style: {
          border: 'solid 2px #62ff6f',
          background: '#dbffdd',
        },
      };
    }
    return {};
  };

  const customSlotPropGetter = (date) => {
    const dateString = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    if ((calendarState.view !== Views.WEEK && calendarState.view !== Views.DAY)
      || !activeWorkScheduleDayList[dateString]
    ) {
      return {};
    }

    const scheduleDay = activeWorkScheduleDayList[dateString];

    if (scheduleDay.workingDay
      && date >= scheduleDay.dayStartTimeFromDate
      && date < scheduleDay.dayStartTimeToDate
    ) {
      return {
        className: 'working-day',
        style: {
          background: '#dbffdd',
        },
      };
    }

    if (scheduleDay.workingDay
      && date >= scheduleDay.dayEndTimeFromDate
      && date < scheduleDay.dayEndTimeToDate
    ) {
      return {
        className: 'working-day',
        style: {
          background: '#dbffdd',
        },
      };
    }

    if (scheduleDay.workingDay
      && date >= scheduleDay.dayStartTimeToDate
      && date < scheduleDay.dayEndTimeFromDate
    ) {
      return {
        className: 'working-day',
        style: {
          background: '#fff1c8',
        },
      };
    }

    return {};
  };

  const handleOnView = (event) => {
    setCalendarState(s => ({ ...s, view: event }));
  };

  const handleOnSelectSlot = (event) => {
    const selectedTimesheetDay = myEventsList.filter(f => moment(f.start).isSame(moment(event.start), 'day'));
    if (selectedTimesheetDay[0]) {
      setUserTimesheetDayId(selectedTimesheetDay[0].id);
      setOpenEditDialog(true);
      return;
    }

    setCreatedSelection({ start: event.start, end: event.end });
    setOpenCreateDialog(true);
  };

  const handleOnSelectEvent = (event) => {
    setUserTimesheetDayId(event.id);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = (reload, dayData) => {
    setOpenEditDialog(false);
    setOpenCreateDialog(false);
    setUserTimesheetDayId(0);
    setCreatedSelection({});

    if (reload && dayData) {
      const newEventList = myEventsList.slice(0);
      newEventList[prepareDataEvent(dayData).id] = prepareDataEvent(dayData);
      setMyEventsList(newEventList);
    }
  };

  return (
    <div className={classes.mainCalendar}>
      <Calendar
        selectable
        localizer={localizer}
        culture="pl"
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        view={calendarState.view}
        onView={handleOnView}
        onSelectEvent={handleOnSelectEvent}
        onSelectSlot={handleOnSelectSlot}
        dayPropGetter={customDayPropGetter}
        slotPropGetter={customSlotPropGetter}
        min={moment('2019-07-19 06:00:00').toDate()}
        max={moment('2019-07-19 20:00:00').toDate()}
        style={{ height: 'calc(100vh - 150px)' }}
      />
      {openEditDialog && (
        <EditUserTimesheetDay
          userTimesheetDayId={userTimesheetDayId}
          open={openEditDialog}
          onClose={handleCloseEditDialog}
        />
      )}
      {openCreateDialog && (
        <CreateUserTimesheetDay
          timeFrom={createdSelection.start}
          timeTo={createdSelection.end}
          open={openCreateDialog}
          onClose={handleCloseEditDialog}
        />
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {};
}

const connectedUserCalendar = connect(mapStateToProps)(UserCalendarComp);
export { connectedUserCalendar as UserCalendar };
