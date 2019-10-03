import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { AppBar, Box, Grid, IconButton, Tab, Tabs, Typography, Dialog } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { apiService, userService } from '../../_services';
import { EditUserTimesheetDayForm } from './EditUserTimesheetDayForm';

function CreateUserTimesheetDayComp(props) {
  const {
    classes,
    open,
    timeFrom,
    timeTo,
    onClose,
  } = props;

  const [state, setState] = useState({
    loaded: false,
    loaderWorkerCount: 0,
    requestError: null,
    tabIndex: 0,
  });
  const [userTimesheetDayData, setUserTimesheetDayData] = useState({
    userTimesheet: {
      owner: {
        lastName: '',
        firstName: '',
      },
    },
    userWorkScheduleDay: {
      dayDefinition: {},
    },
    presenceType: {
      id: -1,
    },
    absenceType: {},
  });
  const isLoading = Boolean(state.loaderWorkerCount > 0);

  useEffect(
    () => {
      setUserTimesheetDayData(s => ({
        ...s,
        presenceTypeId: null,
        absenceTypeId: null,
        dayStartTime: timeFrom,
        dayEndTime: timeTo,
        workingTime: 0,
        timesheetDayDate: moment(timeFrom).format('YYYY-MM-DD'),
      }));
      setState(s => ({ ...s, loaded: true }));
    },
    [timeFrom, timeTo],
  );

  const closeDialogHandler = () => onClose(false);

  const saveDialogHandler = (savedData) => {
    const workingTime = dayData => (!!dayData.dayEndTime && !!dayData.dayStartTime
      ? ((dayData.dayEndTime - dayData.dayStartTime) / 3600000).toFixed(2)
      : 0);
    const isAbsence = Boolean(savedData.presenceType.isAbsence);
    const isTimed = Boolean(savedData.presenceType.isTimed);

    const payload = {
      owner: `/api/users/${userService.getUserData().id}`,
      presenceType: `/api/presence_types/${savedData.presenceTypeId}`,
      absenceType: isAbsence ? `/api/absence_types/${savedData.absenceTypeId}` : null,
      dayStartTime: isTimed
        ? savedData.dayStartTime.toLocaleTimeString(
          'pl-PL',
          { hour: '2-digit', minute: '2-digit' },
        )
        : null,
      dayEndTime: isTimed
        ? savedData.dayEndTime.toLocaleTimeString(
          'pl-PL',
          { hour: '2-digit', minute: '2-digit' },
        )
        : null,
      workingTime: isTimed && !Number.isNaN(workingTime(savedData)) ? workingTime(savedData).toString() : '0',
      dayDate: moment(timeFrom).format('YYYY-MM-DD'),
    };

    setState({ ...state, loaderWorkerCount: state.loaderWorkerCount + 1 });
    apiService.post(`user_timesheet_days/own/create/${payload.dayDate}`, payload)
      .then(
        (result) => {
          setState({ ...state, loaderWorkerCount: state.loaderWorkerCount - 1 });
          onClose(true, result);
        },
        (error) => {
          console.log(error);
          setState({
            ...state,
            requestError: error,
          });
        },
      );
  };

  const handleTabChange = (event, newValue) => {
    setState({ ...state, tabIndex: newValue });
  };

  function TabPanel(propsTabPanel) {
    const { children, value, index, ...other } = propsTabPanel;

    return (
      <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`timesheet-tabpanel-${index}`}
        aria-labelledby={`timesheet-tab-${index}`}
        {...other}
      >
        <Box p={3}>{children}</Box>
      </Typography>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  TabPanel.defaultProps = {
    children: (<></>),
  };

  function applyProps(index) {
    return {
      id: `timesheet-tab-${index}`,
      'aria-controls': `timesheet-tabpanel-${index}`,
    };
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
        <AppBar position="static">
          <Grid container>
            <Grid item xs={11}>
              <Tabs value={state.tabIndex} onChange={handleTabChange}>
                <Tab label="Dodawanie dnia pracy" {...applyProps(0)} />
              </Tabs>
            </Grid>
            <Grid item xs={1} className={classes.centerFlex}>
              <IconButton onClick={closeDialogHandler}>
                <CloseIcon className={classes.icon} />
              </IconButton>
            </Grid>
          </Grid>
        </AppBar>
        <TabPanel value={state.tabIndex} index={0}>
          <EditUserTimesheetDayForm
            userTimesheetDay={userTimesheetDayData}
            open={open}
            onClose={closeDialogHandler}
            onSave={saveDialogHandler}
            classes={classes}
            requestError={state.requestError}
            createMode
          />
        </TabPanel>
      </Dialog>
    </>
  );
}

const styles = theme => ({});

CreateUserTimesheetDayComp.propTypes = {
  open: PropTypes.bool.isRequired,
  timeFrom: PropTypes.instanceOf(Date).isRequired,
  timeTo: PropTypes.instanceOf(Date).isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.instanceOf(Object),
};

CreateUserTimesheetDayComp.defaultProps = {
  classes: {},
};

const mapStateToProps = (state) => ({});

const styledCreateUserTimesheetDay = withStyles(styles)(CreateUserTimesheetDayComp);
const connectedCreateUserTimesheetDay = connect(mapStateToProps)(styledCreateUserTimesheetDay);
export { connectedCreateUserTimesheetDay as CreateUserTimesheetDay };
