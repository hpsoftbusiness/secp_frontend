import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import LinearProgress from '@material-ui/core/LinearProgress';

import { userActions } from '../../_actions';

class Login extends React.Component {
  constructor(props) {
    super(props);

    // reset login status
    const { dispatch } = this.props;
    dispatch(userActions.logout());

    this.state = {
      username: '',
      password: '',
      submitted: false,
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.setState({ submitted: true });
    const { username, password } = this.state;
    const { dispatch } = this.props;
    if (username && password) {
      dispatch(userActions.login(username, password));
    }
  };

  render() {
    const { loggingIn } = this.props;
    const { classes } = this.props;
    const { username, password, submitted } = this.state;
    return (
      <div className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper} elevation={8}>
          <Typography component="h1" variant="h5">
            SECP Login
          </Typography>
          <form className={classes.form} noValidate name="form" onSubmit={this.handleSubmit}>
            <FormControl margin="normal" required fullWidth>
              <TextField
                className={classes.textField}
                value={username}
                name="username"
                label="Login"
                margin="normal"
                variant="standard"
                onChange={this.handleChange}
                error={submitted && !username}
                autoFocus
              />
              {submitted && !username && (
                <FormHelperText error>
                  Podanie loginu jest wymagane
                </FormHelperText>
              )}
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <TextField
                className={classes.textField}
                value={password}
                name="password"
                label="Hasło"
                margin="normal"
                variant="standard"
                type="password"
                onChange={this.handleChange}
                error={submitted && !password}
              />
              {submitted && !password && (
                <FormHelperText error>
                  Podanie hasła jest wymagane
                </FormHelperText>
              )}
            </FormControl>
            <Button
              className={classes.submit}
              color="primary"
              type="submit"
              fullWidth
              disabled={loggingIn}
            >
              Login
            </Button>
            <div className={classes.buttonWrapper}>
              {loggingIn && <LinearProgress />}
            </div>
          </form>
        </Paper>
      </div>
    );
  }
}

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  buttonWrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  textField: {},
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

Login.propTypes = {
  loggingIn: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.instanceOf(Object),
};

Login.defaultProps = {
  loggingIn: false,
  classes: {},
};

function mapStateToProps(state) {
  const { loggingIn } = state.authentication;
  return {
    loggingIn,
  };
}

const styledLoginPage = withStyles(styles)(Login);
const connectedLoginPage = connect(mapStateToProps)(styledLoginPage);
export { connectedLoginPage as Login };
