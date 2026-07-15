import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const repository = {
    findByEmail: jest.fn(),
    recordFailure: jest.fn(),
    recordSuccess: jest.fn(),
    auditLogin: jest.fn(),
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed-token') };
  const service = new AuthService(
    repository as unknown as AuthRepository,
    jwt as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    repository.auditLogin.mockResolvedValue({});
    repository.recordSuccess.mockResolvedValue({});
    repository.recordFailure.mockResolvedValue({});
  });

  it('returns a short-lived bearer token for valid credentials', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'admin-id',
      email: 'admin@example.com',
      displayName: 'Admin',
      passwordHash: await argon2.hash('correct-password'),
      active: true,
      failedLoginCount: 0,
      lockedUntil: null,
    });

    const result = await service.login(
      { email: 'ADMIN@example.com', password: 'correct-password' },
      {},
    );

    expect(result.accessToken).toBe('signed-token');
    expect(result.expiresInSeconds).toBe(1800);
    expect(repository.recordSuccess).toHaveBeenCalledWith('admin-id');
  });

  it('locks the account on the fifth failed login', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'admin-id',
      email: 'admin@example.com',
      displayName: 'Admin',
      passwordHash: await argon2.hash('correct-password'),
      active: true,
      failedLoginCount: 4,
      lockedUntil: null,
    });

    await expect(
      service.login(
        { email: 'admin@example.com', password: 'wrong-password' },
        {},
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(repository.recordFailure).toHaveBeenCalledWith(
      'admin-id',
      5,
      expect.any(Date),
    );
  });
});
