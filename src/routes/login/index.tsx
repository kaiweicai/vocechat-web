/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import BASE_URL from "../../app/config";
// import web3 from "web3";
import StyledWrapper from "./styled";
import MetamaskLoginButton from "./MetamaskLoginButton";
import OidcLoginButton from "./OidcLoginButton";
import Input from "../../common/component/styled/Input";
import Button from "../../common/component/styled/Button";
import MagicLinkLogin from "./MagicLinkLogin";
import SignUpLink from "./SignUpLink";
import { useLoginMutation } from "../../app/services/auth";
import { useGetLoginConfigQuery, useGetSMTPStatusQuery } from "../../app/services/server";
import useGoogleAuthConfig from "../../common/hook/useGoogleAuthConfig";
import useGithubAuthConfig from "../../common/hook/useGithubAuthConfig";
import GoogleLoginButton from "../../common/component/GoogleLoginButton";
import GithubLoginButton from "../../common/component/GithubLoginButton";

export default function LoginPage() {
  const { data: enableSMTP } = useGetSMTPStatusQuery();
  const [login, { isSuccess, isLoading, error }] = useLoginMutation();
  const { clientId } = useGoogleAuthConfig();
  const { config: githubAuthConfig } = useGithubAuthConfig();
  const { data: loginConfig, isSuccess: loginConfigSuccess } = useGetLoginConfigQuery();
  const [input, setInput] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    // const githubCode = query.get("gcode");
    const oauth = query.get("oauth");
    const code = query.get("code");
    const state = query.get("state");
    const magic_token = query.get("magic_token");
    const exists = query.get("exists");
    if (oauth) {
      switch (oauth) {
        case "oidc":
          if (code && state) {
            login({
              code,
              state,
              type: "oidc"
            });
          }
          break;
        default:
          break;
      }
    }
    // magic link
    if (magic_token && typeof exists !== "undefined") {
      // console.log("tokken", token, exists);
      const isLogin = exists == "true";
      if (isLogin) {
        // login
        login({
          magic_token,
          type: "magiclink"
        });
      } else {
        // reg with magic link and set name only
        location.href = `?magic_token=${magic_token}#/register/set_name/login`;
      }
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.log("login err", error);
      switch (error.status) {
        case 401:
          toast.error("Username or Password incorrect");
          break;
        case 410:
          toast.error(
            "No associated account found, please user admin for an invitation link to join."
          );
          break;
        default:
          toast.error("Something Error");
          break;
      }
      return;
    }
  }, [error]);
  useEffect(() => {
    if (isSuccess) {
      toast.success("Login Successfully");
      // navigateTo("/");
    }
  }, [isSuccess]);

  const handleLogin = (evt) => {
    evt.preventDefault();
    console.log("wtf", input);
    login({
      ...input,
      type: "password"
    });
  };

  const handleInput = (evt) => {
    const { type } = evt.target.dataset;
    const { value } = evt.target;
    // console.log(type, value);
    setInput((prev) => {
      prev[type] = value;
      return { ...prev };
    });
  };
  const { email, password } = input;
  if (!loginConfigSuccess) return null;

  const {
    magic_link,
    github: enableGithubLogin,
    google: enableGoogleLogin,
    metamask: enableMetamaskLogin,
    oidc = [],
    who_can_sign_up: whoCanSignUp
  } = loginConfig;

  const enableMagicLink = enableSMTP && magic_link;
  const googleLogin = enableGoogleLogin && clientId;
  const hasDivider =
    enableMagicLink || googleLogin || enableMetamaskLogin || oidc.length > 0 || enableGithubLogin;

  return (
    <StyledWrapper>
      <div className="form">
        <div className="tips">
          <img src={`${BASE_URL}/resource/organization/logo`} alt="logo" className="logo" />
          <h2 className="title">Login to VoceChat</h2>
          <span className="desc">Please enter your details.</span>
        </div>
        <form onSubmit={handleLogin}>
          <Input
            className="large"
            name="email"
            value={email}
            required
            placeholder="Enter your email"
            data-type="email"
            onChange={handleInput}
          />
          <Input
            className="large"
            type="password"
            value={password}
            name="password"
            required
            data-type="password"
            onChange={handleInput}
            placeholder="Enter your password"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing" : `Sign in`}
          </Button>
        </form>
        {hasDivider && <hr className="or" />}
        {enableMagicLink && <MagicLinkLogin />}
        {googleLogin && <GoogleLoginButton clientId={clientId} />}
        {enableGithubLogin && <GithubLoginButton client_id={githubAuthConfig?.client_id} />}
        {enableMetamaskLogin && <MetamaskLoginButton login={login} />}
        {oidc.length > 0 && <OidcLoginButton issuers={oidc} />}
        {whoCanSignUp === "EveryOne" && <SignUpLink />}
      </div>
    </StyledWrapper>
  );
}
