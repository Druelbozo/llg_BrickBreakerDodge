#!/usr/bin/env python3
"""
AWS SSO Authentication Utility
==============================

This module provides functions to ensure AWS CLI SSO authentication is active
and to create boto3 sessions configured with the SSO profile.

All AWS scripts should use this module instead of relying on default credentials.
"""

import subprocess
import sys
import os

# SSO profile name
SSO_PROFILE = 'llg-dev'

# Path to SSO setup guide (relative to project root)
SSO_SETUP_GUIDE = 'documentation/sso/LLG_AWS_CLI_SSO_Setup_Guide.txt'


def check_sso_session_valid():
    """
    Check if SSO session is valid by attempting to get caller identity.

    Returns:
        bool: True if SSO session is valid, False otherwise
    """
    try:
        result = subprocess.run(
            ['aws', 'sts', 'get-caller-identity', '--profile', SSO_PROFILE],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return True
        return False
    except subprocess.TimeoutExpired:
        print(f"⚠️  Warning: SSO session check timed out")
        return False
    except FileNotFoundError:
        print(f"❌ Error: AWS CLI not found. Please install AWS CLI v2.")
        return False
    except Exception as e:
        print(f"⚠️  Warning: Error checking SSO session: {e}")
        return False


def login_sso():
    """Attempt to login to AWS SSO. Opens browser for authentication if needed."""
    try:
        print(f"🔐 Attempting to login to AWS SSO (profile: {SSO_PROFILE})...")
        print(f"   This may open your browser for authentication.")
        result = subprocess.run(
            ['aws', 'sso', 'login', '--profile', SSO_PROFILE],
            timeout=300
        )
        if result.returncode == 0:
            print(f"✅ Successfully logged in to AWS SSO")
            return True
        else:
            print(f"❌ Failed to login to AWS SSO (exit code: {result.returncode})")
            return False
    except subprocess.TimeoutExpired:
        print(f"❌ Error: SSO login timed out")
        return False
    except FileNotFoundError:
        print(f"❌ Error: AWS CLI not found. Please install AWS CLI v2.")
        return False
    except Exception as e:
        print(f"❌ Error during SSO login: {e}")
        return False


def ensure_sso_authenticated():
    """Ensure SSO authentication is active. Checks session, attempts login if needed."""
    if check_sso_session_valid():
        return True
    print(f"ℹ️  SSO session is not valid or expired. Attempting to login...")
    if login_sso():
        if check_sso_session_valid():
            return True
        print(f"⚠️  Warning: Login appeared successful but session validation failed")
        return False
    else:
        print(f"\n❌ Failed to authenticate with AWS SSO")
        print(f"   Please ensure you have completed the SSO setup:")
        print(f"   See: {SSO_SETUP_GUIDE}")
        print(f"\n   Or manually login using:")
        print(f"   aws sso login --profile {SSO_PROFILE}")
        return False


def get_boto3_session():
    """Get a boto3 session configured with the SSO profile."""
    import boto3
    return boto3.Session(profile_name=SSO_PROFILE)


def get_sso_profile_name():
    """Get the SSO profile name being used."""
    return SSO_PROFILE
